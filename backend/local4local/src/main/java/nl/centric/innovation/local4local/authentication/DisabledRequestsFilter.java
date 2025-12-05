package nl.centric.innovation.local4local.authentication;

import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.exceptions.DisabledRequestsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class DisabledRequestsFilter extends OncePerRequestFilter {

    static final List<String> validPaths = List.of(
            "/api/authenticate",
            "/api/authenticate/refreshToken",
            "/api/suppliers/approve/{UUID}",
            "/api/suppliers/rejection/{UUID}",
            "/api/suppliers/change-has-status-update/{UUID}",
            "/api/suppliers/{UUID}",
            "/api/suppliers/register",
            "/api/supplier-profiles/{UUID}",
            "/api/supplier-profiles",
            "/api/tenants/{UUID}",
            "/api/tenants/all",
            "/api/tenants/create",
            "/api/users",
            "/api/users/recover",
            "/api/users/recover/reset-password",
            "/api/grants",
            "/api/supplier-profiles/dropdown-data",
            "/api/working-hours/{UUID}",
            "/api/working-hours/availability/{UUID}"
    );

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain filterChain
    ) throws ServletException, IOException {


        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null) {
            boolean shouldCheckRequest = !checkIfShouldDisableRequest(request.getRequestURI());

            if (isSupplier() && shouldCheckRequest && !isUserApproved()) {
                handleDisabledRequests(response);
                throw new DisabledRequestsException("40019");
            }
        }

        filterChain.doFilter(request, response);

    }

    private void handleDisabledRequests(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.getWriter().write("40019");
        response.getWriter().flush();
        response.getWriter().close();
    }

    private boolean isUserApproved() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return user.isApproved();
    }

    private boolean isSupplier() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return Objects.equals(user.getRole().getName(), Role.ROLE_SUPPLIER);
    }

    private boolean checkIfShouldDisableRequest(String path) {
        return validPaths.stream().anyMatch(pathToCheck -> matchesPath(pathToCheck, path));
    }

    private static boolean matchesPath(String pathToCheck, String path) {
        String regex = "^" + pathToCheck
                .replace("/", "\\/")
                .replace("{UUID}", "[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}")
                + "$";

        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(path);

        return matcher.matches();
    }

}
