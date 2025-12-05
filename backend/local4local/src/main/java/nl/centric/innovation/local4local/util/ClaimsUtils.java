package nl.centric.innovation.local4local.util;

import nl.centric.innovation.local4local.entity.User;

import java.util.HashMap;
import java.util.Map;

public class ClaimsUtils {

    public static Map<String, Object> setClaims(User userDetails) {
        Map<String, Object> extraClaims = new HashMap<>();

        extraClaims.put("userId", userDetails.getId());
        extraClaims.put("username", userDetails.getUsername());
        extraClaims.put("role", userDetails.getRole());
        extraClaims.put("tenantId", userDetails.getTenantId());

        if (userDetails.getSupplier() != null) {
            extraClaims.put("supplierId", userDetails.getSupplier().getId());
        }

        return extraClaims;
    }
}
