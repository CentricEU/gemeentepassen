package nl.centric.innovation.local4local.util;


import lombok.extern.slf4j.Slf4j;
import nl.centric.innovation.local4local.enums.EmailHtmlEnum;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.sesv2.SesV2Client;
import software.amazon.awssdk.services.sesv2.model.Body;
import software.amazon.awssdk.services.sesv2.model.Content;
import software.amazon.awssdk.services.sesv2.model.Destination;
import software.amazon.awssdk.services.sesv2.model.EmailContent;
import software.amazon.awssdk.services.sesv2.model.Message;
import software.amazon.awssdk.services.sesv2.model.MessageRejectedException;
import software.amazon.awssdk.services.sesv2.model.SendEmailRequest;

import java.util.Locale;

import static nl.centric.innovation.local4local.util.Constants.UTF_8;
import static nl.centric.innovation.local4local.util.Constants.i8N_FORMAT;

@Slf4j
@Component
public record MailUtils(ResourceBundleMessageSource messageSource, SesV2Client amazonEmailService) {

    public void sendEmail(String fromAddr, String[] toAddr, String subject, String htmlContent, String textContent) {
        log.info("Sending {} email to {}", subject);
        try {

            SendEmailRequest request = SendEmailRequest.builder().
                    fromEmailAddress(fromAddr)
                    .destination(Destination.builder().toAddresses(toAddr).build())
                    .content(EmailContent.builder()
                            .simple(Message.builder()
                                    .subject(Content.builder()
                                            .data(subject)
                                            .charset(
                                                    "UTF-8")
                                            .build())
                                    .body(Body.builder()
                                            .html(Content.builder()
                                                    .data(htmlContent)
                                                    .charset(
                                                            "UTF-8")
                                                    .build())
                                            .build())
                                    .build())
                            .build())
                    .build();

            amazonEmailService.sendEmail(request);
        } catch (MessageRejectedException e) {
            log.error("Email could not be sent", e);
        }
    }

    public String getEmailStringText(Locale locale, String templateMiddlePath, String emailPart) {
        return messageSource.getMessage(String.format(i8N_FORMAT, templateMiddlePath, emailPart), null, locale);
    }

    public String getEmailStringText(Locale locale, String templateMiddlePath, String emailPart, String variable) {
        return messageSource.getMessage(String.format(i8N_FORMAT, templateMiddlePath, emailPart), null, locale) + variable;
    }

    public String buildTemplateText(MailTemplate mailTemplate) {
        StringBuffer textContentBuffer = new StringBuffer();
        textContentBuffer.append(mailTemplate.getTitle());
        textContentBuffer.append(EmailHtmlEnum.RN.getTag());
        textContentBuffer.append(mailTemplate.getContent());
        textContentBuffer.append(EmailHtmlEnum.RN.getTag());
        textContentBuffer.append(mailTemplate.getAction());
        textContentBuffer.append(EmailHtmlEnum.RN.getTag());
        textContentBuffer.append(mailTemplate.getUrl());
        textContentBuffer.append(EmailHtmlEnum.RN.getTag());
        textContentBuffer.append(mailTemplate.getClosing());
        return textContentBuffer.toString();
    }
}
