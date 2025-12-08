package nl.centric.innovation.local4local.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.RemoteKeySourceException;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.BadJOSEException;
import com.nimbusds.jose.proc.BadJWSException;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jose.util.DefaultResourceRetriever;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.centric.innovation.local4local.authentication.JwtUtil;
import nl.centric.innovation.local4local.dto.LoginResponseDto;
import nl.centric.innovation.local4local.dto.TokenRequest;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.exceptions.AuthenticationLoginException;
import nl.centric.innovation.local4local.exceptions.JwkNotFoundException;
import nl.centric.innovation.local4local.exceptions.JwtValidationException;
import nl.centric.innovation.local4local.repository.UserRepository;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.text.ParseException;
import java.time.Duration;
import java.util.Map;

import static nl.centric.innovation.local4local.util.ClaimsUtils.setClaims;

/**
 * Service for handling authentication and JWT validation via Signicat (external OpenID provider).
 * <p>
 * This class retrieves and uses the JWKS URI from Signicat's OpenID configuration,
 * validates JWT tokens, and extracts user claims from them.
 * For more information, you can refer to the Signicat documentation:
 * <a href="https://developer.signicat.com/docs/eid-hub/oidc/oidc-implementation/#json-web-key-set-jwks"> JSON web key set (JWKS) and Key rotation</a>
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class SignicatService {

    private static final int TIMEOUT_MS = 3000;
    private DefaultJWTProcessor<SecurityContext> jwtProcessor;
    private RemoteJWKSet<SecurityContext> keySource;

    private final UserRepository userRepository;

    private final JwtUtil jwtUtil;

    private final RefreshTokenService refreshTokenService;

    private String jwksUri;

    @Value("${openid.config.url}")
    private String openidConfigUrl;

    @Value("${signicat.issuer}")
    private String issuer;

    @Value("${signicat.client.id}")
    private String clientId;

    @Value("${signicat.userinfo.url}")
    private String userInfoUrl;

    @Value("${error.jwk.notFound}")
    private String jwkNotFoundErrorMessage;

    @Value("${error.bsn.notFound}")
    private String bsnNotFoundErrorMessage;

    @Value("${error.entity.notfound}")
    private String entityNotFoundErrorMessage;

    @Value("${error.userinfo.fetch}")
    private String userInfoFetchErrorMessage;

    @Value("${error.account.notConfirmed}")
    private String accountNotConfirmed;

    @Value("${error.user.deactivated}")
    private String userDeactivatedErrorMessage;

    @Value("${error.digid.invalidToken}")
    private String invalidTokenErrorMessage;

    /**
     * Initializes the JWT processor and key source by loading the OpenID configuration.
     * Called automatically by Spring after bean creation.
     */
    @PostConstruct
    public void init() throws IOException {
        loadJwksUri();
        initializeJwtProcessor();
    }

    /**
     * Authenticates the user using a JWT token provided by Signicat.
     * Validates the token and extracts claims.
     *
     * @param tokenRequest the token request containing the ID token (JWT)
     */
    public LoginResponseDto authenticateWithSignicat(TokenRequest tokenRequest)
            throws AuthenticationLoginException, JwtValidationException, JwkNotFoundException,
            BadJOSEException, IOException, JOSEException {
        User user = validateTokenAndUser(tokenRequest);
        return generateJWT(user);
    }

    /**
     * Loads the JWKS URI from the OpenID configuration URL.
     *
     * @throws IOException if the configuration cannot be retrieved or parsed.
     */
    private void loadJwksUri() throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> config = mapper.readValue(new URL(openidConfigUrl), Map.class);
        jwksUri = (String) config.get("jwks_uri");

        if (jwksUri == null) {
            throw new IllegalStateException("JWKS URI not found in OpenID configuration");
        }
    }

    /**
     * Initializes the JWT processor with the key source and a verification key selector.
     */
    private void initializeJwtProcessor() throws MalformedURLException {
        refreshKeySource();
        jwtProcessor = new DefaultJWTProcessor<>();
        jwtProcessor.setJWSKeySelector(new JWSVerificationKeySelector<>(JWSAlgorithm.RS256, keySource));
    }

    /**
     * Refreshes the key source from the JWKS URI. Disables caching for up-to-date keys.
     */
    private void refreshKeySource() throws MalformedURLException {
        keySource = new RemoteJWKSet<>(
                new URL(jwksUri),
                new DefaultResourceRetriever(TIMEOUT_MS, TIMEOUT_MS),
                null // disable cache for freshness
        );
    }

    /**
     * Validates the JWT token from the provided token request and authenticates the user.
     * If the key ID (kid) from the JWT is not found in the current JWKS, it refreshes the key set
     * and re-attempts validation. Upon successful validation, it retrieves the corresponding user from the database.
     *
     * @param tokenRequest the request containing the ID token (JWT) and access token
     * @return the User entity corresponding to the validated JWT claims
     * @throws JwtValidationException if the JWT is invalid, the key is not found, or no user matches the claims
     */
    private User validateTokenAndUser(TokenRequest tokenRequest)
            throws AuthenticationLoginException, JwkNotFoundException, JwtValidationException,
            JOSEException, BadJOSEException, IOException {
        try {
            var signedJWT = SignedJWT.parse(tokenRequest.tokenId());
            var kid = signedJWT.getHeader().getKeyID();

            if (!isKeyPresent(kid)) {
                refreshKeySource();
                updateKeySelector();

                if (!isKeyPresent(kid)) {
                    throw new JwkNotFoundException(jwkNotFoundErrorMessage);
                }
            }

            User user = validateClaims(jwtProcessor.process(signedJWT, null), tokenRequest.accessToken());

            if (!user.getIsEnabled()) {
                throw new AuthenticationLoginException(accountNotConfirmed);
            }

            if (!user.isActive()) {
                throw new AuthenticationLoginException(userDeactivatedErrorMessage);
            }

            return user;
        } catch (ParseException | BadJWSException e) {
            throw new JwtValidationException(invalidTokenErrorMessage);
        }
    }

    /**
     * Checks if the key source contains a key with the given key ID (kid).
     *
     * @param kid the key ID from the JWT header
     * @return true if the key is present, false otherwise
     */
    private boolean isKeyPresent(String kid) throws RemoteKeySourceException {
        var keys = keySource.get(
                new com.nimbusds.jose.jwk.JWKSelector(
                        new com.nimbusds.jose.jwk.JWKMatcher.Builder().keyID(kid).build()
                ),
                null
        );
        return !keys.isEmpty();
    }

    /**
     * Updates the JWT processor's key selector with the current key source.
     */
    private void updateKeySelector() {
        jwtProcessor.setJWSKeySelector(new JWSVerificationKeySelector<>(JWSAlgorithm.RS256, keySource));
    }

    /**
     * Validates key claims from the JWT token, including issuer and audience.
     * Add additional validations if needed.
     *
     * @param claimsSet   the parsed JWT claims set
     * @param accessToken the access token used to call the UserInfo endpoint if needed
     * @return the User entity associated with the BSN (nin) claim
     * @throws JwtValidationException if the claims are invalid
     * @throws IOException            if fetching user info fails
     * @throws ParseException         if claims parsing fails
     */
    private User validateClaims(JWTClaimsSet claimsSet, String accessToken)
            throws JwtValidationException, IOException, ParseException {

        validateIssuerAndAudience(claimsSet);

        // Extract the BSN (nin) claim from the JWT.
        String nin = validateNinClaim(claimsSet, accessToken);
        return findUserByNin(nin);
    }

    /**
     * Validates the issuer and audience claims in the JWT.
     *
     * @param claimsSet the parsed claims set
     * @throws JwtValidationException if issuer or audience are invalid
     */
    private void validateIssuerAndAudience(JWTClaimsSet claimsSet) throws JwtValidationException {
        if (!issuer.equals(claimsSet.getIssuer())) {
            throw new JwtValidationException("Invalid issuer");
        }

        if (!claimsSet.getAudience().contains(clientId)) {
            throw new JwtValidationException("Invalid audience");
        }
    }

    /**
     * Extracts the BSN (nin) from the JWT claims or falls back to UserInfo endpoint.
     *
     * @param claimsSet   the parsed claims set
     * @param accessToken the access token for UserInfo call if needed
     * @return the nin (BSN) value
     * @throws JwtValidationException if nin is missing in both sources
     * @throws IOException            if UserInfo call fails
     */
    private String validateNinClaim(JWTClaimsSet claimsSet, String accessToken)
            throws JwtValidationException, IOException, ParseException {

        //TODO Check this when we'll have pre-production environment, to see if the bsn will be returned
        String nin = claimsSet.getStringClaim("nin");

        if (StringUtils.isNotBlank(nin)) {
            return nin;
        }

        log.info("BSN (nin) not found in ID token, attempting to fetch from UserInfo endpoint...");

        var userInfoClaims = fetchUserInfo(accessToken);
        log.info("UserInfo claims: {}", userInfoClaims);

        nin = (String) userInfoClaims.get("nin");

        if (StringUtils.isBlank(nin)) {
            throw new JwtValidationException(bsnNotFoundErrorMessage);
        }

        return nin;
    }

    /**
     * Retrieves the User by BSN (nin) from the database.
     *
     * @param nin the BSN identifier
     * @return the User entity
     * @throws JwtValidationException if no user is found
     */
    private User findUserByNin(String nin) throws JwtValidationException {
        return userRepository.findUserByBsn(nin)
                .orElseThrow(() -> new JwtValidationException(entityNotFoundErrorMessage));
    }

    /**
     * Fetches user information from the Signicat UserInfo endpoint using the provided access token.
     * This is used as a fallback if the BSN (nin) claim is missing in the ID token.
     *
     * @param accessToken the OAuth2 access token used for authorization
     * @return a map of claims returned from the UserInfo endpoint
     * @throws IOException if the request fails or response cannot be parsed
     */
    private Map<String, Object> fetchUserInfo(String accessToken) throws IOException {
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofMillis(TIMEOUT_MS))
                .build();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(userInfoUrl))
                .timeout(Duration.ofMillis(TIMEOUT_MS))
                .header("Authorization", "Bearer " + accessToken)
                .header("Accept", "application/json")
                .GET()
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new IOException(userInfoFetchErrorMessage);
            }

            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(response.body(), Map.class);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("UserInfo request interrupted", e);
        }
    }

    /**
     * Generates the application's JWT and refresh token for an authenticated user.
     * Embeds user claims in the JWT for downstream authorization.
     *
     * @param user the authenticated user for whom tokens will be generated
     * @return a LoginResponseDto containing both JWT and refresh token
     */
    private LoginResponseDto generateJWT(User user) {
        Map<String, Object> extraClaims = setClaims(user);
        String token = jwtUtil.generateToken(extraClaims, user);
        String refreshToken = refreshTokenService.getRefreshToken(user).getToken();

        return LoginResponseDto.of(token, refreshToken);

    }

}
