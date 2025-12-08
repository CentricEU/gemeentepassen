package nl.centric.innovation.local4local.security;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

/**
 * A filter to intercept all incoming HTTP requests and apply XSS protection.
 */
@WebFilter("/*")
public class XSSFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;

        ServletRequest wrappedRequest = (httpRequest.getContentType() != null
                && httpRequest.getContentType().toLowerCase().startsWith("multipart/"))
                ? request
                : new XSSRequestWrapper(httpRequest);

        chain.doFilter(wrappedRequest, response);
    }
}
