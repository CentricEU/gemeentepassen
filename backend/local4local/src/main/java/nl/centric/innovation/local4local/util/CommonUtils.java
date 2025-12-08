package nl.centric.innovation.local4local.util;

import nl.centric.innovation.local4local.entity.Role;

import javax.annotation.Nullable;

public final class CommonUtils {

    public static String getBaseUrl(String role, String baseUrl, String baseMunicipalityUrl, String baseCitizenUrl) {
        return role.equals(Role.ROLE_SUPPLIER) ? baseUrl : role.equals(Role.ROLE_MUNICIPALITY_ADMIN) ? baseMunicipalityUrl : baseCitizenUrl;
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

        switch (role != null ? role.toUpperCase() : "") {
            case "ROLE_SUPPLIER":
                return isValid(supplierLang) ? supplierLang : "nl-NL";
            case "ROLE_MUNICIPALITY_ADMIN":
                return isValid(municipalityLang) ? municipalityLang : "nl-NL";
            case "ROLE_CITIZEN":
                return isValid(citizenLang) ? citizenLang : "nl-NL";
            default:
                if (isValid(supplierLang)) return supplierLang;
                if (isValid(municipalityLang)) return municipalityLang;
                if (isValid(citizenLang)) return citizenLang;
                return "nl-NL";
        }
    }

    private static boolean isValid(String lang) {
        return lang != null && !lang.isEmpty();
    }

}
