package nl.centric.innovation.local4local.authentication;

import java.io.IOException;

import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import io.jsonwebtoken.ExpiredJwtException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerExceptionResolver;

@Component
public class L4LAuthenticationEntryPoint implements AuthenticationEntryPoint {
	@Value("${error.jwt.expired}")
	private String errorJWTExpired;
	
	@Override
	public void commence(
			HttpServletRequest request,
			HttpServletResponse response,
			AuthenticationException authException)
			throws IOException {
		var exception = request.getAttribute("exception");
		
		// Only for this exception we need a custom error.
		if (exception instanceof ExpiredJwtException) {
			response.setStatus(HttpStatus.UNAUTHORIZED.value());
			response.setContentType("application/json");
			// This will set the error to the custom error code
			response.getWriter().println(errorJWTExpired);
			response.getWriter().flush();
		} else {
			response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
		}
	}
	
	private HttpServletResponse asHTTP(ServletResponse response) {
		return (HttpServletResponse) response;
	}
}
