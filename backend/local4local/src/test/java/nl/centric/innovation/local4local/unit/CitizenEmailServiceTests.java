package nl.centric.innovation.local4local.unit;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;

import com.amazonaws.services.simpleemail.AmazonSimpleEmailService;
import com.amazonaws.services.simpleemail.model.SendEmailRequest;
import com.amazonaws.services.simpleemail.model.SendEmailResult;
import nl.centric.innovation.local4local.entity.Tenant;
import nl.centric.innovation.local4local.service.impl.CitizenEmailService;
import nl.centric.innovation.local4local.service.impl.CitizenMailTemplateBuilderImpl;
import nl.centric.innovation.local4local.util.MailTemplate;
import nl.centric.innovation.local4local.util.MailUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.support.ResourceBundleMessageSource;

@ExtendWith(MockitoExtension.class)
public class CitizenEmailServiceTests {

    @Mock
    private AmazonSimpleEmailService amazonEmailService;

    @Mock
    private CitizenMailTemplateBuilderImpl citizenMailTemplateBuilder;

    private CitizenEmailService citizenEmailService;

    @BeforeEach
    public void setUp() {
        ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
        messageSource.setBasenames("i18n/messages");
        messageSource.setUseCodeAsDefaultMessage(true);

        MailUtils mailUtils = new MailUtils(messageSource, amazonEmailService);

        citizenEmailService = new CitizenEmailService(
                citizenMailTemplateBuilder,
                mailUtils
        );
    }

    @Test
    public void GivenValidTenant_WhenSendSummaryEmailAfterApplyForPass_ThenAmazonEmailServiceShouldBeCalled() {
        // Given
        Tenant tenant = new Tenant();
        tenant.setName("Test Tenant");
        tenant.setPhone("123456789");
        tenant.setEmail("tenant@example.com");

        MailTemplate mockTemplate = MailTemplate.builder()
                .subject("Subject")
                .title("Title")
                .content("Content")
                .action("Action")
                .tenantName("Test Tenant")
                .tenantTelephone("123456789")
                .tenantWebsite("https://tenant.website")
                .tenantEmail("tenant@example.com")
                .endNote("End Note")
                .build();

        when(citizenMailTemplateBuilder.buildEmailTemplate(any())).thenReturn("<html>Email</html>");
        when(amazonEmailService.sendEmail(any(SendEmailRequest.class))).thenReturn(new SendEmailResult());

        // When
        citizenEmailService.sendSummaryEmailAfterApplyForPass("citizen@example.com", "en", tenant);

        // Then
        verify(amazonEmailService, times(1)).sendEmail(any(SendEmailRequest.class));
    }
}