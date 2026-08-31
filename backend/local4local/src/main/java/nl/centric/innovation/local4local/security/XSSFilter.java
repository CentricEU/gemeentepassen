package nl.centric.innovation.local4local.security;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;

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
