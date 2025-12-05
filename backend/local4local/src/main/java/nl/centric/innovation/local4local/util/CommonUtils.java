package nl.centric.innovation.local4local.util;

public final class CommonUtils {

    public static String getBaseUrl(boolean isSupplierUser, String baseUrl, String baseMunicipalityUrl) {
        return isSupplierUser ? baseUrl : baseMunicipalityUrl;
    }
}
