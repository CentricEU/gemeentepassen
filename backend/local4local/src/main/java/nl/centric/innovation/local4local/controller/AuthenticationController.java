package nl.centric.innovation.local4local.controller;

import nl.centric.innovation.local4local.dto.AuthResponseDto;
import nl.centric.innovation.local4local.dto.TokenRefreshResponseDto;
import nl.centric.innovation.local4local.exceptions.AuthenticationLoginException;
import nl.centric.innovation.local4local.exceptions.CaptchaException;
import nl.centric.innovation.local4local.exceptions.DtoValidateNotFoundException;
import nl.centric.innovation.local4local.exceptions.TokenRefreshException;
import nl.centric.innovation.local4local.service.interfaces.RefreshTokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.slf4j.Slf4j;
import nl.centric.innovation.local4local.dto.LoginRequestDTO;
import nl.centric.innovation.local4local.dto.LoginResponseDTO;
import nl.centric.innovation.local4local.exceptions.InvalidRoleException;
import nl.centric.innovation.local4local.exceptions.L4LException;
import nl.centric.innovation.local4local.service.interfaces.AuthenticationService;

import javax.servlet.http.HttpServletRequest;

@Slf4j
@RestController
@RequestMapping("/authenticate")
public class AuthenticationController {

    @Autowired
    private AuthenticationService authService;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @PostMapping()
    public ResponseEntity<LoginResponseDTO> createAuthenticationToken(@RequestBody LoginRequestDTO loginDTO,
                                                                      HttpServletRequest request)
            throws CaptchaException, L4LException, AuthenticationLoginException, InvalidRoleException, DtoValidateNotFoundException {

        AuthResponseDto authenticateByRole = authService.authenticateByRole(loginDTO, request);
        return ResponseEntity.ok().headers(authenticateByRole.httpHeaders()).body(authenticateByRole.loginResponseDTO());
    }

    @PostMapping("/refreshToken")
    public ResponseEntity<?> refreshToken(@CookieValue(name = "refreshToken") String requestRefreshToken) throws TokenRefreshException {
        TokenRefreshResponseDto tokenRefreshResponseDto = refreshTokenService.refreshToken(requestRefreshToken);
        return ResponseEntity.ok(tokenRefreshResponseDto);
    }

}
