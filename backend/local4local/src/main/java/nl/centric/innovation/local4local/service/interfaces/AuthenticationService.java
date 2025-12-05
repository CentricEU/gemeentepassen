package nl.centric.innovation.local4local.service.interfaces;

import nl.centric.innovation.local4local.dto.AuthResponseDto;
import nl.centric.innovation.local4local.dto.LoginRequestDTO;
import nl.centric.innovation.local4local.exceptions.InvalidRoleException;
import nl.centric.innovation.local4local.exceptions.AuthenticationLoginException;
import nl.centric.innovation.local4local.exceptions.CaptchaException;
import nl.centric.innovation.local4local.exceptions.L4LException;

import javax.servlet.http.HttpServletRequest;

public interface AuthenticationService {

    AuthResponseDto authenticateByRole(LoginRequestDTO loginRequestDTO, HttpServletRequest request)
            throws L4LException, CaptchaException, AuthenticationLoginException, InvalidRoleException;

}
