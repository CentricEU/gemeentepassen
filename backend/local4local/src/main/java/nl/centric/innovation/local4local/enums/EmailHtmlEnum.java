package nl.centric.innovation.local4local.enums;

public enum EmailHtmlEnum {

    P_START("<p style=\"margin: 0;\">"),
    P_END("</p>"),
    BOLD_START("<b>"),
    BOLD_END("</b>"),
    LINE_BREAK("<br>"),
    RN("\r\n"),
    EXCL("!");

    private final String html;

    EmailHtmlEnum(String html) {
        this.html = html;
    }

    public String getTag() {
        return html;
    }
}
