package nl.centric.innovation.local4local.unit;

import lombok.SneakyThrows;
import nl.centric.innovation.local4local.authentication.JwtUtil;
import nl.centric.innovation.local4local.dto.AuthResponseDto;
import nl.centric.innovation.local4local.dto.LoginRequestDTO;
import nl.centric.innovation.local4local.entity.LoginAttempt;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.exceptions.AuthenticationLoginException;
import nl.centric.innovation.local4local.exceptions.CaptchaException;
import nl.centric.innovation.local4local.exceptions.InvalidRoleException;
import nl.centric.innovation.local4local.security.SecurityUtils;
import nl.centric.innovation.local4local.service.impl.AuthenticationServiceImpl;
import nl.centric.innovation.local4local.service.impl.CaptchaServiceImpl;
import nl.centric.innovation.local4local.service.impl.LoginAttemptServiceImpl;
import nl.centric.innovation.local4local.service.interfaces.RefreshTokenService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import nl.centric.innovation.local4local.entity.RefreshToken;
import org.springframework.test.util.ReflectionTestUtils;

import javax.servlet.http.HttpServletRequest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AuthenticationServiceImplTests {
    @InjectMocks
    private AuthenticationServiceImpl authenticationService;

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private LoginAttemptServiceImpl loginAttemptService;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private CaptchaServiceImpl captchaService;

    @Mock
    private HttpServletRequest request;

    @Mock
    private RefreshTokenService refreshTokenService;

    private static final String VALID_RESPONSE = "validResponse";
    private static final String INVALID_RESPONSE = "invalidResponse";
    private static final String PASSWORD = "password";
    private static final String USERNAME = "username";
    private static final String EMPTY_STRING = "";
    private static final String REMOTE_ADDRESS = "0.0.0.1";

    @Test
    @SneakyThrows
    void GivenValidRequest_WhenAuthenticateByRole_ThenExpectSuccess() {
        // Given
        LoginRequestDTO loginRequestDTO = loginRequestDTOBuilder(EMPTY_STRING, false);
        Role role = Role.builder().name(Role.ROLE_MUNICIPALITY_ADMIN).id(0).build();

        // Mock the behavior of loadUserByUsername to return a User object with isEnabled set to true
        User mockUser = User.builder().username("username").role(role).isEnabled(true).build();
        when(userDetailsService.loadUserByUsername(loginRequestDTO.username()))
                .thenReturn(mockUser);

        when(jwtUtil.generateToken(anyMap(), any(UserDetails.class))).thenReturn("mocked-token");

        // When
        AuthResponseDto result = authenticationService.authenticateByRole(loginRequestDTO, request);

        // Then
        assertNotNull(result.loginResponseDTO().token());
    }


    @Test
    @SneakyThrows
    void GivenValidRequestWithCaptcha_WhenAuthenticateByRole_ThenExpectSuccess() {
        // Given
        LoginRequestDTO loginRequestDTO = loginRequestDTOBuilder(VALID_RESPONSE, false);
        Role role = Role.builder().name(Role.ROLE_MUNICIPALITY_ADMIN).id(0).build();

        // Mock the behavior of loadUserByUsername to return a User object with isEnabled set to true
        User mockUser = User.builder().username("username").role(role).isEnabled(true).build();
        when(userDetailsService.loadUserByUsername(loginRequestDTO.username()))
                .thenReturn(mockUser);

        when(captchaService.isResponseValid(any(), any())).thenReturn(true);
        when(jwtUtil.generateToken(anyMap(), any(UserDetails.class))).thenReturn("mocked-token");

        // When
        AuthResponseDto result = authenticationService.authenticateByRole(loginRequestDTO, request);

        // Then
        assertNotNull(result.loginResponseDTO().token());
    }


    @Test
    void GivenNoCaptchaResponse_WhenAuthenticateByRole_ThenExpectL4LException() {
        // Given
        LoginRequestDTO loginRequestDTO = loginRequestDTOBuilder(INVALID_RESPONSE, false);

        when(captchaService.isResponseValid(any(), any())).thenReturn(false);

        // When and Then
        assertThrows(CaptchaException.class, () -> authenticationService.authenticateByRole(loginRequestDTO, request));
    }

    @Test
    void GivenInvalidRole_WhenAuthenticateByRole_ThenExpectInvalidRoleException() {
        // Given
        Role expectedRole = Role.builder().name(Role.ROLE_SUPPLIER).id(0).build();

        LoginRequestDTO loginRequestDTO = loginRequestDTOBuilder(VALID_RESPONSE, false);

        // Mock the behavior of captchaService.isResponseValid to return true
        when(captchaService.isResponseValid(any(), any())).thenReturn(true);

        // Mock the behavior of loadUserByUsername to return a User object with the expected role and isEnabled set to true
        User mockUser = User.builder().username("username").role(expectedRole).isEnabled(true).build();
        when(userDetailsService.loadUserByUsername(loginRequestDTO.username()))
                .thenReturn(mockUser);

        // When and Then
        assertThrows(InvalidRoleException.class, () -> authenticationService.authenticateByRole(loginRequestDTO, request));
    }

    @Test
    void GivenIsResponseValidAndInvalidCredentials_WhenAuthenticateByRole_ThenExpectAuthenticationLoginException() {
        // Given
        LoginRequestDTO loginRequestDTO = loginRequestDTOBuilder(INVALID_RESPONSE, false);

        when(captchaService.isResponseValid(any(), any())).thenReturn(true);
        when(authenticationManager.authenticate(any())).thenThrow(BadCredentialsException.class);
        // When and Then
        assertThrows(AuthenticationLoginException.class, () -> authenticationService.authenticateByRole(loginRequestDTO,
                request));
    }

    @Test
    void GivenIsResponseValidAndDisabledAccount_WhenAuthenticateByRole_ThenExpectAuthenticationLoginException() {
        // Given
        LoginRequestDTO loginRequestDTO = loginRequestDTOBuilder(INVALID_RESPONSE, false);

        when(captchaService.isResponseValid(any(), any())).thenReturn(true);
        when(authenticationManager.authenticate(any())).thenThrow(DisabledException.class);
        // When and Then
        assertThrows(AuthenticationLoginException.class, () -> authenticationService.authenticateByRole(loginRequestDTO,
                request));
    }

    @Test
    void GivenIsResponseValidAndTooManyAttempts_WhenAuthenticateByRole_ThenExpectCaptchaException() {
        // Given
        LoginRequestDTO loginRequestDTO = loginRequestDTOBuilder(INVALID_RESPONSE, false);

        when(captchaService.isResponseValid(any(), any())).thenReturn(true);
        when(authenticationManager.authenticate(any())).thenThrow(BadCredentialsException.class);
        when(loginAttemptService.isBlocked(any())).thenReturn(true);
        // When and Then
        assertThrows(CaptchaException.class, () -> authenticationService.authenticateByRole(loginRequestDTO, request));
    }

    @Test
    @SneakyThrows
    public void GivenRequestRememberMeTrue_WhenAuthenticateByRole_ThenExpectSuccess() {
        // Given
        ReflectionTestUtils.setField(authenticationService, "refreshTokenDuration", "2592000");
        LoginRequestDTO loginRequestDTO = loginRequestDTOBuilder(EMPTY_STRING, true);
        Role role = Role.builder().name(Role.ROLE_MUNICIPALITY_ADMIN).id(0).build();

        // Mock the behavior of loadUserByUsername to return a User object with isEnabled set to true
        User mockUser = User.builder().username("username").role(role).isEnabled(true).build();
        when(userDetailsService.loadUserByUsername(loginRequestDTO.username()))
                .thenReturn(mockUser);

        when(jwtUtil.generateToken(anyMap(), any(UserDetails.class))).thenReturn("mocked-token");

        // Mock the behavior of refreshTokenService.getRefreshToken to return a valid RefreshToken object
        when(refreshTokenService.getRefreshToken(any(User.class))).thenReturn(RefreshToken.builder()
                .token("refresh-token")
                .build());

        // When
        AuthResponseDto result = authenticationService.authenticateByRole(loginRequestDTO, request);

        // Then
        assertNotNull(result);
    }


    @Test
    void GivenRecaptchaResponseEmptyAndLoginAttemptsAbove_WhenAuthenticateByRole_ThenExpectL4LException() {
        // Given
        LoginRequestDTO loginRequestDTO = loginRequestDTOBuilder(EMPTY_STRING, false);

        LoginAttempt loginAttempt = LoginAttempt.builder()
                .remoteAddress(REMOTE_ADDRESS)
                .count(5)
                .build();
        // When
        when(SecurityUtils.getClientIP(request)).thenReturn(REMOTE_ADDRESS);
        when(loginAttemptService.findByRemoteAddress(REMOTE_ADDRESS)).thenReturn(Optional.of(loginAttempt));
        when(loginAttemptService.isBlocked(loginAttempt)).thenReturn(true);

        // Then
        assertThrows(CaptchaException.class, () -> authenticationService.authenticateByRole(loginRequestDTO, request));
    }

    @Test
    void GivenDisabledUser_WhenAuthenticateByRole_ThenExpectAuthenticationLoginException() {
        // Given
        LoginRequestDTO loginRequestDTO = loginRequestDTOBuilder(VALID_RESPONSE, false);
        String remoteAddress = "0.0.0.1";

        // When
        User disabledUser = User.builder().username("username").isEnabled(false).build();
        when(userDetailsService.loadUserByUsername(loginRequestDTO.username()))
                .thenReturn(disabledUser);

        // Mock the behavior of captchaService.isResponseValid to return true, as this might be called before the user check
        when(captchaService.isResponseValid(any(), any())).thenReturn(true);

        // When and Then
        assertThrows(AuthenticationLoginException.class, () ->
                authenticationService.authenticateByRole(loginRequestDTO, request));
    }

    private LoginRequestDTO loginRequestDTOBuilder(String reCaptchaResponse, Boolean rememberMe) {
        return LoginRequestDTO.builder()
                .password(PASSWORD)
                .username(USERNAME)
                .role(Role.ROLE_MUNICIPALITY_ADMIN)
                .reCaptchaResponse(reCaptchaResponse)
                .rememberMe(rememberMe)
                .build();
    }

}

