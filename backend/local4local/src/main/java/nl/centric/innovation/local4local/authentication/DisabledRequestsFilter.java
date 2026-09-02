package nl.centric.innovation.local4local.authentication;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import nl.centric.innovation.local4local.entity.Role;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.enums.SupplierStatusEnum;
import nl.centric.innovation.local4local.exceptions.DisabledRequestsException;
import nl.centric.innovation.local4local.util.CommonUtils;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static nl.centric.innovation.local4local.util.Constants.ERROR_CODE_MUNICIPALITY_NOT_APPROVED;
import static nl.centric.innovation.local4local.util.Constants.ERROR_CODE_SUPPLIER_NOT_APPROVED;

public class DisabledRequestsFilter extends OncePerRequestFilter {

    //TODO to see what really belongs here
    static final List<String> VALID_PATHS_SUPPLIER = List.of(
            "/api/authenticate",
            "/api/authenticate/refresh-token",
            "/api/suppliers/approve/{UUID}",
            "/api/suppliers/rejection/{UUID}",
            "/api/suppliers/change-has-status-update/{UUID}",
            "/api/suppliers/clear-status-update/{UUID}",
            "/api/suppliers/{UUID}",
            "/api/suppliers/register",
            "/api/suppliers/{UUID}/cashiers",
            "/api/suppliers/detail/{UUID}",
            "/api/supplier-profiles",
            "/api/supplier-profiles/reapplication",
            "/api/supplier-profiles/cashiers",
            "/api/supplier-profiles/dropdown-data",
            "/api/tenants/{UUID}",
            "/api/tenants/all",
            "/api/tenants/create",
            "/api/users",
            "/api/users/recover",
            "/api/users/recover/reset-password",
            "/api/working-hours/{UUID}",
            "/api/working-hours/availability/{UUID}"
    );

    static final List<String> VALID_PATHS_MUNICIPALITY = List.of(
            "/api/authenticate",
            "/api/authenticate/refresh-token",
            "/api/tenants/{UUID}",
            "/api/users",
            "/api/users/recover",
            "/api/users/recover/reset-password",
            "/api/tenants/bank-information"
    );

    static final String SUPPLIER_PROFILE_PATH = "/api/supplier-profiles/{UUID}";
    static final String TIMELINE_PATH = "/api/audit/timeline/{UUID}";

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain filterChain
    ) throws IOException, ServletException {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null) {
            User user = (User) authentication.getPrincipal();
            String path = request.getRequestURI();

            if (isRejectedSupplierAccessingOwnProfileOrTimeline(user, path)) {
                filterChain.doFilter(request, response);
                return;
            }

            if (isSupplier(user) && !isAllowedPath(path, VALID_PATHS_SUPPLIER) && !user.isApproved()) {
                handleDisabledRequests(response, ERROR_CODE_SUPPLIER_NOT_APPROVED);
                throw new DisabledRequestsException(ERROR_CODE_SUPPLIER_NOT_APPROVED);
            }

            if (isMunicipality(user) && !isAllowedPath(path, VALID_PATHS_MUNICIPALITY) && !user.isApproved()) {
                handleDisabledRequests(response, ERROR_CODE_MUNICIPALITY_NOT_APPROVED);
                throw new DisabledRequestsException(ERROR_CODE_MUNICIPALITY_NOT_APPROVED);
            }
        }

        filterChain.doFilter(request, response);

    }

    private boolean isRejectedSupplierAccessingOwnProfileOrTimeline(User user, String path) {
        return isSupplier(user)
                && (matchesPath(SUPPLIER_PROFILE_PATH, path) || matchesPath(TIMELINE_PATH, path))
                && user.getSupplier().getStatus() == SupplierStatusEnum.REJECTED;
    }

    private void handleDisabledRequests(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.getWriter().write(message);
        response.getWriter().flush();
        response.getWriter().close();

    }

    private boolean isAllowedPath(String requestPath, List<String> validPaths) {
        return validPaths.stream().anyMatch(p -> matchesPath(p, requestPath));
    }

    private boolean isSupplier(User user) {
        return Objects.equals(user.getRole().getName(), Role.ROLE_SUPPLIER);
    }

    private boolean isMunicipality(User user) {
        return CommonUtils.isMunicipality(user.getRole().getName());
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
