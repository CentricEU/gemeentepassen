package nl.centric.innovation.local4local.unit;

import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import lombok.SneakyThrows;
import nl.centric.innovation.local4local.authentication.JwtUtil;
import nl.centric.innovation.local4local.dto.LoginResponseDto;
import nl.centric.innovation.local4local.dto.TokenRequest;
import nl.centric.innovation.local4local.entity.RefreshToken;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.exceptions.AuthenticationLoginException;
import nl.centric.innovation.local4local.exceptions.JwtValidationException;
import nl.centric.innovation.local4local.repository.UserRepository;
import nl.centric.innovation.local4local.service.impl.RefreshTokenService;
import nl.centric.innovation.local4local.service.impl.SignicatService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SignicatServiceTests {

    String tokenId = "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2lzc3Vlci5leGFtcGxlLmNvbSIsImF1ZCI6ImNsaWVudC1pZCIsIm5pbiI6IjEyMzQ1Njc4OSJ9.signature";
    String accessToken = "access-token";

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private RefreshTokenService refreshTokenService;

    @InjectMocks
    private SignicatService signicatService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(signicatService, "issuer", "https://issuer.example.com");
        ReflectionTestUtils.setField(signicatService, "clientId", "client-id");
        ReflectionTestUtils.setField(signicatService, "jwtProcessor", mock(DefaultJWTProcessor.class));
        ReflectionTestUtils.setField(signicatService, "keySource", mock(RemoteJWKSet.class));
        ReflectionTestUtils.setField(signicatService, "bsnNotFoundErrorMessage", "BSN not found");
    }

    @Test
    @SneakyThrows
    void authenticateWithSignicat_shouldReturnLoginResponse_whenTokenIsValid() {
        // Given
        TokenRequest tokenRequest = new TokenRequest(tokenId, accessToken);

        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .issuer("https://issuer.example.com")
                .audience("client-id")
                .claim("nin", "123456789")
                .build();

        User user = new User();
        user.setIsEnabled(true);
        user.setActive(true);
        String jwt = "jwt-token";
        String refreshTokenValue = "refresh-token";

        RefreshToken mockRefreshToken = new RefreshToken();
        mockRefreshToken.setToken(refreshTokenValue);

        DefaultJWTProcessor<SecurityContext> processor = mock(DefaultJWTProcessor.class);
        RemoteJWKSet<SecurityContext> keySource = mock(RemoteJWKSet.class);

        ReflectionTestUtils.setField(signicatService, "jwtProcessor", processor);
        ReflectionTestUtils.setField(signicatService, "keySource", keySource);

        when(keySource.get(any(), any())).thenReturn(List.of(mock(com.nimbusds.jose.jwk.JWK.class)));

        when(processor.process(any(SignedJWT.class), isNull())).thenReturn(claimsSet);

        when(userRepository.findUserByBsn("123456789")).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken(anyMap(), eq(user))).thenReturn(jwt);
        when(refreshTokenService.getRefreshToken(user)).thenReturn(mockRefreshToken);

        // When
        LoginResponseDto response = signicatService.authenticateWithSignicat(tokenRequest);

        // Verify
        Assertions.assertEquals(jwt, response.token());
        Assertions.assertEquals(refreshTokenValue, response.refreshToken());
    }

    @Test
    @SneakyThrows
    void validateIssuerAndAudience_shouldThrowException_whenAudienceInvalid() {
        // Given
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .issuer("https://issuer.example.com")
                .audience("wrong-client-id") // invalid audience
                .build();

        // Use reflection to invoke the private method
        var method = SignicatService.class.getDeclaredMethod("validateIssuerAndAudience", JWTClaimsSet.class);
        method.setAccessible(true); // allow access to private method

        // When / Then
        InvocationTargetException thrown = Assertions.assertThrows(InvocationTargetException.class, () -> {
            method.invoke(signicatService, claimsSet);
        });

        // Verify
        Throwable actualException = thrown.getCause();
        assertInstanceOf(JwtValidationException.class, actualException);
        Assertions.assertEquals("Invalid audience", actualException.getMessage());
    }

    @Test
    @SneakyThrows
    void validateIssuerAndAudience_shouldPass_whenIssuerAndAudienceValid() {
        // Given
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .issuer("https://issuer.example.com")
                .audience("client-id")
                .build();

        // Use reflection to invoke the private method
        var method = SignicatService.class.getDeclaredMethod("validateIssuerAndAudience", JWTClaimsSet.class);
        method.setAccessible(true);

        // When / Verify
        Assertions.assertDoesNotThrow(() -> {
            method.invoke(signicatService, claimsSet);
        });
    }

    @Test
    @SneakyThrows
    void validateNinClaim_shouldReturnNin_whenNinExistsInClaims() {
        // Given
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .claim("nin", "123456789")
                .build();

        var method = SignicatService.class.getDeclaredMethod("validateNinClaim", JWTClaimsSet.class, String.class);
        method.setAccessible(true);

        // When
        String nin = (String) method.invoke(signicatService, claimsSet, "access-token");

        // Verify
        Assertions.assertEquals("123456789", nin);
    }

    @Test
    @SneakyThrows
    void authenticateWithSignicat_shouldThrowException_whenUserNotFound() {
        // Given
        TokenRequest tokenRequest = new TokenRequest(tokenId, accessToken);

        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .issuer("https://issuer.example.com")
                .audience("client-id")
                .claim("nin", "123456789")
                .build();

        DefaultJWTProcessor<SecurityContext> processor = mock(DefaultJWTProcessor.class);
        RemoteJWKSet<SecurityContext> keySource = mock(RemoteJWKSet.class);
        ReflectionTestUtils.setField(signicatService, "jwtProcessor", processor);
        ReflectionTestUtils.setField(signicatService, "keySource", keySource);
        ReflectionTestUtils.setField(signicatService, "jwksUri", "https://example.com/.well-known/jwks.json");

        when(processor.process(any(SignedJWT.class), isNull())).thenReturn(claimsSet);
        when(keySource.get(any(), any())).thenReturn(List.of(mock(com.nimbusds.jose.jwk.JWK.class)));
        when(userRepository.findUserByBsn("123456789")).thenReturn(Optional.empty());

        // When / Verify
        Assertions.assertThrows(JwtValidationException.class, () -> {
            signicatService.authenticateWithSignicat(tokenRequest);
        });
    }

    @Test
    @SneakyThrows
    void validateIssuerAndAudience_shouldThrowException_whenIssuerInvalid() {
        // Given
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .issuer("wrong-issuer")
                .audience("client-id")
                .build();

        var method = SignicatService.class.getDeclaredMethod("validateIssuerAndAudience", JWTClaimsSet.class);
        method.setAccessible(true);

        // When / Then
        InvocationTargetException thrown = Assertions.assertThrows(InvocationTargetException.class, () -> {
            method.invoke(signicatService, claimsSet);
        });

        // Verify
        Throwable actualException = thrown.getCause();
        assertInstanceOf(JwtValidationException.class, actualException);
        Assertions.assertEquals("Invalid issuer", actualException.getMessage());
    }

    @Test
    @SneakyThrows
    void validateNinClaim_shouldFetchFromUserInfo_whenNinNotInClaims() {
        // Given
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder().build(); // No nin claim

        ReflectionTestUtils.setField(signicatService, "userInfoUrl", "http://test.com/userinfo");

        var method = SignicatService.class.getDeclaredMethod("validateNinClaim", JWTClaimsSet.class, String.class);
        method.setAccessible(true);

        // Mock the fetchUserInfo method using reflection
        var fetchUserInfoMethod = SignicatService.class.getDeclaredMethod("fetchUserInfo", String.class);
        fetchUserInfoMethod.setAccessible(true);

        // When / Then
        Assertions.assertThrows(InvocationTargetException.class, () -> {
            method.invoke(signicatService, claimsSet, accessToken);
        });
    }

    @Test
    @SneakyThrows
    void init_shouldThrowException_whenJwksUriNotFound() {
        // Given
        ReflectionTestUtils.setField(signicatService, "openidConfigUrl", "invalid-url");

        // When / Then
        Assertions.assertThrows(IOException.class, () -> {
            signicatService.init();
        });
    }

    @Test
    @SneakyThrows
    void findUserByNin_shouldThrowException_whenUserNotFound() {
        // Given
        String nin = "nonexistent-nin";
        when(userRepository.findUserByBsn(nin)).thenReturn(Optional.empty());

        var method = SignicatService.class.getDeclaredMethod("findUserByNin", String.class);
        method.setAccessible(true);

        // When / Then
        InvocationTargetException thrown = Assertions.assertThrows(InvocationTargetException.class, () -> {
            method.invoke(signicatService, nin);
        });

        // Verify
        Throwable actualException = thrown.getCause();
        assertInstanceOf(JwtValidationException.class, actualException);
    }

    @Test
    @SneakyThrows
    void validateTokenAndUser_shouldThrowException_whenAccountIsNotConfirmed_directCall() {
        // Given
        TokenRequest tokenRequest = new TokenRequest(tokenId, accessToken);

        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .issuer("https://issuer.example.com")
                .audience("client-id")
                .claim("nin", "123456789")
                .build();

        User user = new User();
        user.setIsEnabled(false);
        user.setActive(true);

        DefaultJWTProcessor<SecurityContext> processor = mock(DefaultJWTProcessor.class);
        RemoteJWKSet<SecurityContext> keySource = mock(RemoteJWKSet.class);
        ReflectionTestUtils.setField(signicatService, "jwtProcessor", processor);
        ReflectionTestUtils.setField(signicatService, "keySource", keySource);
        ReflectionTestUtils.setField(signicatService, "accountNotConfirmed", "Account is not confirmed");

        when(processor.process(any(SignedJWT.class), isNull())).thenReturn(claimsSet);
        when(keySource.get(any(), any())).thenReturn(List.of(mock(com.nimbusds.jose.jwk.JWK.class)));
        when(userRepository.findUserByBsn("123456789")).thenReturn(Optional.of(user));

        var method = SignicatService.class.getDeclaredMethod("validateTokenAndUser", TokenRequest.class);
        method.setAccessible(true);

        // When / Then
        InvocationTargetException ex = Assertions.assertThrows(InvocationTargetException.class, () -> {
            method.invoke(signicatService, tokenRequest);
        });

        Throwable cause = ex.getCause();
        assertInstanceOf(AuthenticationLoginException.class, cause);
        Assertions.assertEquals("Account is not confirmed", cause.getMessage());
    }

    @Test
    @SneakyThrows
    void validateTokenAndUser_shouldThrowException_whenUserIsNotActive_directCall() {
        // Given
        TokenRequest tokenRequest = new TokenRequest(tokenId, accessToken);

        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .issuer("https://issuer.example.com")
                .audience("client-id")
                .claim("nin", "123456789")
                .build();

        User user = new User();
        user.setIsEnabled(true);
        user.setActive(false);

        DefaultJWTProcessor<SecurityContext> processor = mock(DefaultJWTProcessor.class);
        RemoteJWKSet<SecurityContext> keySource = mock(RemoteJWKSet.class);
        ReflectionTestUtils.setField(signicatService, "jwtProcessor", processor);
        ReflectionTestUtils.setField(signicatService, "keySource", keySource);
        ReflectionTestUtils.setField(signicatService, "userDeactivatedErrorMessage", "User is deactivated");

        when(processor.process(any(SignedJWT.class), isNull())).thenReturn(claimsSet);
        when(keySource.get(any(), any())).thenReturn(List.of(mock(com.nimbusds.jose.jwk.JWK.class)));
        when(userRepository.findUserByBsn("123456789")).thenReturn(Optional.of(user));

        var method = SignicatService.class.getDeclaredMethod("validateTokenAndUser", TokenRequest.class);
        method.setAccessible(true);

        // When / Then
        InvocationTargetException ex = Assertions.assertThrows(InvocationTargetException.class, () -> {
            method.invoke(signicatService, tokenRequest);
        });

        Throwable cause = ex.getCause();
        assertInstanceOf(AuthenticationLoginException.class, cause);
        Assertions.assertEquals("User is deactivated", cause.getMessage());
    }


}

