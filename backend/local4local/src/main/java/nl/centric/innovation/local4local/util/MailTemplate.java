package nl.centric.innovation.local4local.util;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Locale;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MailTemplate {
    private Locale locale;
    private String logoImage;
    private String title;
    private String content;
    private String url;
    private String action;
    private String subject;
    private String btnText;
    private String closing;
    private String tenantName;
    private String tenantTelephone;
    private String tenantWebsite;
    private String tenantEmail;
    private String endNote;

}
