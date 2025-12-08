package nl.centric.innovation.local4local.util;

public class Constants {
    public static final double ZERO_AMOUNT = 0.0;

    public static final String URL_REGEX = "^(?:|(?:(?:https?:)?\\/\\/)?(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,6}(?::[0-9]{1,5})?(?:\\/[^\\s]*)?)$";

    public static final String ERROR_CODE_SUPPLIER_NOT_APPROVED = "40019";
    public static final String ERROR_CODE_MUNICIPALITY_NOT_APPROVED = "40040";

    public static final int MAX_FILE_LIST_COUNT = 40;
    public static final Long MAX_FILE_BYTES_SIZE = 10485760L;
    public static final String SUPPORTED_TXT = "text/plain";
    public static final String SUPPORTED_PDF = "application/pdf";
    public static final String SUPPORTED_DOC = "application/msword";
    public static final String SUPPORTED_DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    // UTF_8: Character encoding used for email content
    public static final String UTF_8 = "UTF-8";
    // i8N_FORMAT: Format string for internationalized message keys, e.g., "mail.template.subject"
    public static final String i8N_FORMAT = "mail.%s.%s";

    private Constants() {
    }
}

