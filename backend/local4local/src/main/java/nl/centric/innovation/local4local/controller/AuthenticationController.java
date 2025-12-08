package nl.centric.innovation.local4local.controller;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.proc.BadJOSEException;
import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.dto.AuthResponseDto;
import nl.centric.innovation.local4local.dto.TokenRefreshResponseDto;
import nl.centric.innovation.local4local.dto.TokenRequest;
import nl.centric.innovation.local4local.exceptions.AuthenticationLoginException;
import nl.centric.innovation.local4local.exceptions.CaptchaException;
import nl.centric.innovation.local4local.exceptions.JwkNotFoundException;
import nl.centric.innovation.local4local.exceptions.JwtValidationException;
import nl.centric.innovation.local4local.exceptions.TokenRefreshException;
import nl.centric.innovation.local4local.service.impl.AuthenticationService;
import nl.centric.innovation.local4local.service.impl.RefreshTokenService;
import nl.centric.innovation.local4local.service.impl.SignicatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.slf4j.Slf4j;
import nl.centric.innovation.local4local.dto.LoginRequestDTO;
import nl.centric.innovation.local4local.dto.LoginResponseDto;
import nl.centric.innovation.local4local.exceptions.InvalidRoleException;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.io.IOException;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/authenticate")
public class AuthenticationController {

    private final AuthenticationService authService;

    private final RefreshTokenService refreshTokenService;

    private final SignicatService signicatService;

    @PostMapping()
    public ResponseEntity<LoginResponseDto> createAuthenticationToken(@RequestBody @Valid LoginRequestDTO loginDTO,
                                                                      HttpServletRequest request)
            throws CaptchaException, AuthenticationLoginException, InvalidRoleException {

        AuthResponseDto authenticateByRole = authService.authenticateByRole(loginDTO, request);
        return ResponseEntity.ok().headers(authenticateByRole.httpHeaders()).body(authenticateByRole.loginResponseDTO());
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@CookieValue(name = "refreshToken", required = false) String requestRefreshToken) throws TokenRefreshException {
        TokenRefreshResponseDto tokenRefreshResponseDto = refreshTokenService.refreshToken(requestRefreshToken);
        return ResponseEntity.ok(tokenRefreshResponseDto);
    }

    @PostMapping("/signicat")
    public ResponseEntity<?> authenticateWithSignicat(@RequestBody @Valid TokenRequest token) throws AuthenticationLoginException, JwtValidationException, BadJOSEException, IOException, JwkNotFoundException, JOSEException {
        LoginResponseDto loginResponse = signicatService.authenticateWithSignicat(token);
        return ResponseEntity.ok(loginResponse);

    }

}
