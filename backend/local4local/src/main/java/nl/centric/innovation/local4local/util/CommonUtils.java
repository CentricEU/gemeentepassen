package nl.centric.innovation.local4local.util;

import jakarta.annotation.Nullable;
import nl.centric.innovation.local4local.entity.Role;

import java.util.List;


public final class CommonUtils {

    public static String getBaseUrl(String role, String baseUrl, String baseMunicipalityUrl, String baseCitizenUrl) {
        return switch (role) {
            case Role.ROLE_SUPPLIER, Role.ROLE_CASHIER -> baseUrl;
            case Role.ROLE_MUNICIPALITY_ADMIN, Role.ROLE_SUPER_ADMIN -> baseMunicipalityUrl;
            default -> baseCitizenUrl;
        };
    }

    /**
     * Selects the language based on role and available cookies.
     *
     * @param role             The role of the user (e.g., "CITIZEN", "SUPPLIER", "MUNICIPALITY").
     * @param supplierLang     language_supplier cookie value
     * @param municipalityLang language_municipality cookie value
     * @param citizenLang      language_citizen cookie value
     * @return selected language, defaults to "nl-NL"
     */
    public static String selectLanguage(@Nullable String role,
                                        @Nullable String supplierLang,
                                        @Nullable String municipalityLang,
                                        @Nullable String citizenLang) {

        return switch (role != null ? role.toUpperCase() : "") {
            case Role.ROLE_SUPPLIER -> isValid(supplierLang) ? supplierLang : "nl-NL";
            case Role.ROLE_MUNICIPALITY_ADMIN, Role.ROLE_SUPER_ADMIN ->
                    isValid(municipalityLang) ? municipalityLang : "nl-NL";
            case Role.ROLE_CITIZEN -> isValid(citizenLang) ? citizenLang : "nl-NL";
            default -> {
                if (isValid(supplierLang)) yield supplierLang;
                if (isValid(municipalityLang)) yield municipalityLang;
                if (isValid(citizenLang)) yield citizenLang;
                yield "nl-NL";
            }
        };
    }

    public static boolean isMunicipality(String role) {
        List<String> municipalityRoles = List.of(Role.ROLE_SUPER_ADMIN, Role.ROLE_MUNICIPALITY_ADMIN);
        return municipalityRoles.contains(role);
    }

    private static boolean isValid(String lang) {
        return lang != null && !lang.isEmpty();
    }

}
