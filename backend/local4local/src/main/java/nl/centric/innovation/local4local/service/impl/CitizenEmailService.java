package nl.centric.innovation.local4local.service.impl;


import com.amazonaws.services.simpleemail.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.enums.EmailStructureEnum;
import nl.centric.innovation.local4local.enums.EmailTemplateEnum;
import nl.centric.innovation.local4local.util.MailTemplate;
import nl.centric.innovation.local4local.util.MailUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
@PropertySource({"classpath:application.properties"})
public class CitizenEmailService {
    @Value("${local4local.default.email.sender}")
    private String emailSender;

    private final CitizenMailTemplateBuilderImpl citizenMailTemplateBuilder;

    private final MailUtils mailUtils;

    public void sendSummaryEmailAfterApplyForPass(String toAddress, String language, Tenant tenant) {
        MailTemplate mailTemplate = getSummaryEmailAfterApplyForPass(
                language,
                EmailTemplateEnum.SUMMARY_EMAIL_AFTER_APPLY_FOR_PASS.getTemplate(),
                tenant);
        String htmlContent = citizenMailTemplateBuilder.buildEmailTemplate(mailTemplate);
        String textContent = mailUtils.buildTemplateText(mailTemplate);
        mailUtils.sendEmail(emailSender,
                new String[]{toAddress},
                mailTemplate.getSubject(),
                htmlContent,
                textContent);
    }

    private MailTemplate getSummaryEmailAfterApplyForPass(String language, String templateMiddlePart, Tenant tenant) {
        Locale locale = new Locale(language);
        return buildCitizenTemplate(locale, tenant, templateMiddlePart);
    }

    private MailTemplate buildCitizenTemplate(
            Locale locale,
            Tenant tenant,
            String templateMiddlePart) {
        String title = mailUtils.getEmailStringText(locale, templateMiddlePart, EmailStructureEnum.TITLE.getStructure());
        String subject = mailUtils.getEmailStringText(locale, templateMiddlePart, EmailStructureEnum.SUBJECT.getStructure());
        String content = mailUtils.getEmailStringText(locale, templateMiddlePart, EmailStructureEnum.CONTENT.getStructure());
        String action = mailUtils.getEmailStringText(locale, templateMiddlePart, EmailStructureEnum.ACTION.getStructure());
        String tenantName = tenant != null ? tenant.getName() : "";
        String tenantTelephone = tenant != null ? tenant.getPhone() : "";
        String tenantWebsite = mailUtils.getEmailStringText(locale, templateMiddlePart, EmailStructureEnum.TENANT_WEBSITE.getStructure());
        String tenantEmail = tenant != null ? tenant.getEmail() : "";
        String endNote = mailUtils.getEmailStringText(locale, templateMiddlePart, EmailStructureEnum.END_NOTE.getStructure());

        return MailTemplate.builder()
                .locale(locale)
                .title(title)
                .subject(subject)
                .content(content)
                .action(action)
                .tenantName(tenantName)
                .tenantTelephone(tenantTelephone)
                .tenantWebsite(tenantWebsite)
                .tenantEmail(tenantEmail)
                .endNote(endNote)
                .build();
    }
}
