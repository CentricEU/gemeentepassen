package nl.centric.innovation.local4local.security;

import javax.servlet.http.HttpServletRequest;
import java.util.Optional;

public class SecurityUtils {
    public static String getClientIP(HttpServletRequest httpRequest) {
        Optional<String> xfHeader = Optional.ofNullable(httpRequest.getHeader("X-Forwarded-For"));
        if (xfHeader.isPresent()) {
            return xfHeader.get().split(",")[0];
        }
        return httpRequest.getRemoteAddr();
    }
}

