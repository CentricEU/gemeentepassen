package nl.centric.innovation.local4local.authentication;

import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.service.impl.RefreshTokenService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.SimpleUrlLogoutSuccessHandler;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.io.IOException;

@Component
@RequiredArgsConstructor
public class LogoutSuccessHandler extends SimpleUrlLogoutSuccessHandler {
    private final RefreshTokenService refreshTokenService;

    @Override
    public void onLogoutSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication)
            throws IOException, ServletException {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                String cookieName = cookie.getName();
                if ("refreshToken".equals(cookieName)) {
                    refreshTokenService.deleteByToken(cookie.getValue());
                    ResponseCookie cookieToDelete = deleteCookie(cookieName);
                    response.addHeader(HttpHeaders.SET_COOKIE, cookieToDelete.toString());
                    break;
                }
            }
        }

        response.setStatus(200);
    }

    private ResponseCookie deleteCookie(String cookieName) {
        return ResponseCookie.from(cookieName, null)
                .maxAge(0)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .sameSite("None")
                .build();
    }
}
