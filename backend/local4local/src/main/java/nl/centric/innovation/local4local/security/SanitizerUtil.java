package nl.centric.innovation.local4local.security;

import nl.centric.innovation.local4local.enums.PolicyLevel;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.text.StringEscapeUtils;

import org.jsoup.nodes.Document;
import org.jsoup.Jsoup;


public class SanitizerUtil {

    // Default response if sanitization results in an empty string
    private static final String DEFAULT_RESPONSE = "Default text";

    // Sanitizes input using the BASIC policy level
    public static String sanitize(String input) {
        return sanitize(input, PolicyLevel.BASIC);
    }

    // Sanitizes input using the EXTENDED policy level (more tags allowed)
    public static String sanitizeWithMoreTags(String input) {
        return sanitize(input, PolicyLevel.EXTENDED);
    }

    private static String sanitize(String input, PolicyLevel level) {
        if (StringUtils.isBlank(input)) {
            return null;
        }

        String sanitized = level.getPolicy().sanitize(input);
        sanitized = StringEscapeUtils.unescapeHtml4(sanitized);

        return sanitized.isEmpty() ? DEFAULT_RESPONSE : sanitized;
    }

    // Checks if the input string contains any HTML elements (by parsing it)
    public static boolean isHtml(String input) {
        if (StringUtils.isBlank(input)) {
            return false;
        }

        Document doc = Jsoup.parseBodyFragment(input);
        return !doc.body().children().isEmpty();
    }
}
