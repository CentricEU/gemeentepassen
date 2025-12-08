package nl.centric.innovation.local4local.util;

import com.amazonaws.services.simpleemail.AmazonSimpleEmailService;
import com.amazonaws.services.simpleemail.model.Body;
import com.amazonaws.services.simpleemail.model.Message;
import com.amazonaws.services.simpleemail.model.SendEmailRequest;
import com.amazonaws.services.simpleemail.model.Content;
import com.amazonaws.services.simpleemail.model.MessageRejectedException;
import com.amazonaws.services.simpleemail.model.Destination;
import lombok.extern.slf4j.Slf4j;
import nl.centric.innovation.local4local.enums.EmailHtmlEnum;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.stereotype.Component;

import java.util.Locale;

import static nl.centric.innovation.local4local.util.Constants.UTF_8;
import static nl.centric.innovation.local4local.util.Constants.i8N_FORMAT;

@Slf4j
@Component
public record MailUtils(ResourceBundleMessageSource messageSource, AmazonSimpleEmailService amazonEmailService) {

    public void sendEmail(String fromAddr, String[] toAddr, String subject, String htmlContent, String textContent) {
        log.info("Sending {} email to {}", subject);
        try {

            SendEmailRequest request = new SendEmailRequest().withDestination(new Destination().withToAddresses(toAddr))
                    .withMessage(new Message()
                            .withBody(new Body().withHtml(new Content().withCharset(UTF_8).withData(htmlContent))
                                    .withText(new Content().withCharset(UTF_8).withData(textContent)))
                            .withSubject(new Content().withCharset(UTF_8).withData(subject)))
                    .withSource(fromAddr);
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
