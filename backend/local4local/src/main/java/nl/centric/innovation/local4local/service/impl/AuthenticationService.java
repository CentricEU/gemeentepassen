package nl.centric.innovation.local4local.service.impl;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.authentication.JwtUtil;
import nl.centric.innovation.local4local.dto.AuthResponseDto;
import nl.centric.innovation.local4local.dto.LoginRequestDTO;
import nl.centric.innovation.local4local.dto.LoginResponseDto;
import nl.centric.innovation.local4local.entity.LoginAttempt;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.exceptions.AuthenticationLoginException;
import nl.centric.innovation.local4local.exceptions.CaptchaException;
import nl.centric.innovation.local4local.exceptions.InvalidRoleException;
import nl.centric.innovation.local4local.security.SecurityUtils;
import nl.centric.innovation.local4local.service.interfaces.CaptchaService;
import nl.centric.innovation.local4local.service.interfaces.LoginAttemptService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.http.HttpCookie;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import java.util.Collection;
import java.util.Map;
import java.util.Optional;

import static nl.centric.innovation.local4local.util.ClaimsUtils.setClaims;

@Service
@RequiredArgsConstructor
@PropertySource({"classpath:errorcodes.properties"})
public class AuthenticationService {

    private final UserDetailsService userDetailsService;

    private final JwtUtil jwtUtil;

    private final AuthenticationManager authenticationManager;

    private final LoginAttemptService loginAttemptService;

    private final CaptchaService captchaService;

    private final RefreshTokenService refreshTokenService;

    @Value("${error.captcha.show}")
    private String errorCaptchaShow;
    @Value("${error.captcha.notCompleted}")
    private String errorCaptchaNotCompleted;

    @Value("${error.credentials.invalid}")
    private String errorCredentialsInvalid;

    @Value("${jwt.refresh.expiration}")
    private String refreshTokenDuration;

    @Value("${error.account.notConfirmed}")
    private String accountNotConfirmed;

    @Value("${error.user.deactivated}")
    private String userDeactivatedErrorMessage;

    public AuthResponseDto authenticateByRole(LoginRequestDTO loginRequestDTO, HttpServletRequest request)
            throws CaptchaException, AuthenticationLoginException, InvalidRoleException {

        String remoteAddress = SecurityUtils.getClientIP(request);
        boolean isRecaptchaBlank = StringUtils.isBlank(loginRequestDTO.reCaptchaResponse());
        Optional<LoginAttempt> loginAttempt = loginAttemptService.findByRemoteAddress(remoteAddress);

        if (loginAttempt.isPresent() && loginAttemptService.isBlocked(loginAttempt.get()) && isRecaptchaBlank) {
            loginAttemptService.countLoginAttempts(loginAttempt, remoteAddress, false);
            throw new CaptchaException(errorCaptchaShow);
        }

        if (isRecaptchaBlank || captchaService.isResponseValid(loginRequestDTO.reCaptchaResponse(), remoteAddress)) {
            return performAuthentication(loginRequestDTO, remoteAddress, loginAttempt);
        }

        throw new CaptchaException(errorCaptchaNotCompleted);

    }

    private AuthResponseDto performAuthentication(LoginRequestDTO loginRequestDTO, String remoteAddress,
                                                  Optional<LoginAttempt> loginAttempt)
            throws CaptchaException, AuthenticationLoginException, InvalidRoleException {

        authenticate(loginAttempt, loginRequestDTO, remoteAddress);


        final User userDetails = (User) userDetailsService.loadUserByUsername(loginRequestDTO.username());

        if (!userDetails.getIsEnabled()) {
            throw new AuthenticationLoginException(accountNotConfirmed);
        }

        Collection<? extends GrantedAuthority> authorities = userDetails.getAuthorities();

        boolean isRoleValid = authorities.stream()
                .anyMatch(a -> a.getAuthority().equals(loginRequestDTO.role()) ||
                        (a.getAuthority().equals("ROLE_CASHIER") && loginRequestDTO.role().equals("ROLE_SUPPLIER")));

        if (!isRoleValid) {
            throw new InvalidRoleException("Unexpected role");
        }

        if (loginRequestDTO.role().equals(Role.ROLE_CITIZEN) && !userDetails.isActive()) {
            throw new AuthenticationLoginException(userDeactivatedErrorMessage);
        }

        loginAttemptService.countLoginAttempts(loginAttempt, remoteAddress, true);

        Map<String, Object> extraClaims = setClaims(userDetails);

        String token = jwtUtil.generateToken(extraClaims, userDetails);
        HttpHeaders httpHeaders = new HttpHeaders();

        String refreshToken = null;

        if (loginRequestDTO.rememberMe()) {
            refreshToken = refreshTokenService.getRefreshToken(userDetails).getToken();
            httpHeaders.add(HttpHeaders.SET_COOKIE,
                    createCookie(refreshToken).toString());
        }

        return AuthResponseDto.builder()
                .loginResponseDTO(LoginResponseDto.builder()
                        .token(token)
                        .refreshToken(refreshToken)
                        .build())
                .httpHeaders(httpHeaders)

                .build();

    }

    private void authenticate(Optional<LoginAttempt> loginAttempt, LoginRequestDTO loginRequestDTO,
                              String remoteAddress) throws CaptchaException, AuthenticationLoginException {
        var username = loginRequestDTO.username();
        var password = loginRequestDTO.password();

        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
        } catch (DisabledException e) {
            throw new AuthenticationLoginException("USER_DISABLED");
        } catch (BadCredentialsException e) {
            this.manageBadCredentials(loginRequestDTO, remoteAddress, loginAttempt);
        }
    }

    private void manageBadCredentials(LoginRequestDTO loginRequestDTO, String remoteAddress, Optional<LoginAttempt> loginAttempt) throws CaptchaException, AuthenticationLoginException {
        LoginAttempt loginAttemptResult = loginAttemptService.countLoginAttempts(loginAttempt, remoteAddress, false);
        if (loginAttemptService.isBlocked(loginAttemptResult)) {
            if (loginRequestDTO.reCaptchaResponse() == null || loginRequestDTO.reCaptchaResponse().isEmpty()) {
                throw new CaptchaException(errorCaptchaShow);
            }
            throw new CaptchaException(errorCredentialsInvalid);
        }

        throw new AuthenticationLoginException(errorCredentialsInvalid);
    }

    private HttpCookie createCookie(String refreshToken) {
        return ResponseCookie.from("refreshToken", refreshToken)
                .maxAge(Integer.parseInt(refreshTokenDuration))
                .httpOnly(true)
                .sameSite("None")
                .secure(true)
                .path("/")
                .build();
    }

}

