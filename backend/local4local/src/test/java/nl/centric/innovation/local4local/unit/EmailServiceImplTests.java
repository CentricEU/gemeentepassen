package nl.centric.innovation.local4local.unit;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Locale;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.test.util.ReflectionTestUtils;

import com.amazonaws.services.simpleemail.AmazonSimpleEmailService;
import com.amazonaws.services.simpleemail.model.Body;
import com.amazonaws.services.simpleemail.model.Content;
import com.amazonaws.services.simpleemail.model.Destination;
import com.amazonaws.services.simpleemail.model.Message;
import com.amazonaws.services.simpleemail.model.MessageRejectedException;
import com.amazonaws.services.simpleemail.model.SendEmailRequest;
import com.amazonaws.services.simpleemail.model.SendEmailResult;

import lombok.SneakyThrows;
import nl.centric.innovation.local4local.enums.EmailStructureEnum;
import nl.centric.innovation.local4local.service.impl.EmailServiceImpl;
import nl.centric.innovation.local4local.service.interfaces.MailTemplateBuilder;
import nl.centric.innovation.local4local.util.MailTemplate;

@ExtendWith(MockitoExtension.class)
public class EmailServiceImplTests {
    @InjectMocks
    private EmailServiceImpl emailService;
    @Mock
    private AmazonSimpleEmailService amazonEmailService;

    @Mock
    private MailTemplateBuilder mailTemplateBuilder;

    private SendEmailRequest expectedRequest;

    @BeforeEach
    public void setUp() {

        ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
        messageSource.setBasenames("i18n/messages");
        messageSource.setUseCodeAsDefaultMessage(true);

        ReflectionTestUtils.setField(emailService, "messageSource", messageSource);
    }

    @Test
    @SneakyThrows
    public void GivenNotValid_WhenSendEmail_ThenExpectError() {
        when(amazonEmailService.sendEmail(expectedRequest)).thenThrow(MessageRejectedException.class);
        assertThrows(MessageRejectedException.class, () -> amazonEmailService.sendEmail(expectedRequest));
    }

    @Test
    public void GivenValidRequest_WhenSendEmail_ThenResponseShouldNotBeNull() {
        when(amazonEmailService.sendEmail(expectedRequest)).thenReturn(new SendEmailResult());
        SendEmailResult response = amazonEmailService.sendEmail(expectedRequest);
        assertNotNull(response);
    }

    @Test
    public void GivenValidMailTemplate_WhenBuildingTemplateText_ThenExpectAllFieldToBePresent() {
        // Given
        MailTemplate mailTemplate = MailTemplate.builder()
                .locale(new Locale("nl-NL"))
                .logoImage(EmailStructureEnum.LOGO_IMAGE.getStructure())
                .title(EmailStructureEnum.TITLE.getStructure())
                .content(EmailStructureEnum.CONTENT.getStructure())
                .url(EmailStructureEnum.URL.getStructure())
                .action(EmailStructureEnum.ACTION.getStructure())
                .subject(EmailStructureEnum.SUBJECT.getStructure())
                .btnText(EmailStructureEnum.BTN_TEXT.getStructure())
                .closing(EmailStructureEnum.CLOSING.getStructure())
                .build();

        // When
        String textContent = ReflectionTestUtils.invokeMethod(emailService, "buildTemplateText", mailTemplate);

        // Then
        assertNotNull(textContent);
        assertTrue(textContent.contains(mailTemplate.getTitle()));
        assertTrue(textContent.contains(mailTemplate.getContent()));
        assertTrue(textContent.contains(mailTemplate.getAction()));
        assertTrue(textContent.contains(mailTemplate.getUrl()));
        assertTrue(textContent.contains(mailTemplate.getClosing()));
        assertFalse(textContent.contains(mailTemplate.getLogoImage()));
        assertFalse(textContent.contains(mailTemplate.getBtnText()));
    }

    @Test
    void GivenValid_WhenSendOfferReviewEmail_ThenExpectAmazonEmailServiceToBeCalled() {
        // Arrange
        String url = "http://example.com";
        String[] toAddress = {"to@example.com"};
        String language = "en";
        String receiverName = "John Doe";
        String supplierName = "ACME Corporation";
        String repName = "Alice Smith";
        String htmlContent = "<html><body><h1>Test Content</h1></body></html>";

        when(mailTemplateBuilder.buildEmailTemplate(any())).thenReturn(htmlContent);
        when(amazonEmailService.sendEmail(any())).thenReturn(null);

        // Act
        emailService.sendOfferReviewEmail(url, toAddress, language, receiverName, supplierName, repName);

        // Then
        verify(mailTemplateBuilder, times(1)).buildEmailTemplate(any());
        verify(amazonEmailService, times(1)).sendEmail(any());
    }

    @Test
    void GivenValid_WhenSendProfileCreatedEmail_ThenExpectAmazonEmailServiceToBeCalled() {
        // Arrange
        String url = "http://example.com";
        String[] toAddress = {"to@example.com"};
        String language = "en";
        String receiverName = "John Doe";
        String supplierName = "ACME Corporation";
        String repName = "Alice Smith";
        String htmlContent = "<html><body><h1>Test Content</h1></body></html>";

        when(mailTemplateBuilder.buildEmailTemplate(any())).thenReturn(htmlContent);
        when(amazonEmailService.sendEmail(any())).thenReturn(null);

        // Act
        emailService.sendProfileCreatedEmail(url, toAddress, language, receiverName, supplierName, repName);

        // Then
        verify(mailTemplateBuilder, times(1)).buildEmailTemplate(any());
        verify(amazonEmailService, times(1)).sendEmail(any());
    }

    @Test
    void GivenValid_WhenSendApproveProfileEmail_ThenExpectAmazonEmailServiceToBeCalled() {
        // Arrange
        String url = "http://example.com";
        String[] toAddress = {"to@example.com"};
        String language = "en";
        String receiverName = "John Doe";
        String htmlContent = "<html><body><h1>Test Content</h1></body></html>";
        String municipalityName = "MunicipalityName";

        when(mailTemplateBuilder.buildEmailTemplate(any())).thenReturn(htmlContent);
        when(amazonEmailService.sendEmail(any())).thenReturn(null);

        // Act
        emailService.sendApproveProfileEmail(url, toAddress, language, receiverName, municipalityName);

        // Then
        verify(mailTemplateBuilder, times(1)).buildEmailTemplate(any());
        verify(amazonEmailService, times(1)).sendEmail(any());
    }

    @Test
    void GivenValid_WhenSendPasswordRecoveryEmail_ThenExpectAmazonEmailServiceToBeCalled() {
        // Given
        String url = "http://example.com";
        String[] toAddress = {"to@example.com"};
        String language = "en";
        String htmlContent = "<html><body><h1>Test Content</h1></body></html>";

        when(mailTemplateBuilder.buildEmailTemplate(any())).thenReturn(htmlContent);
        when(amazonEmailService.sendEmail(any())).thenReturn(null);

        // When
        emailService.sendPasswordRecoveryEmail(url, toAddress, language);

        // Then
        verify(mailTemplateBuilder, times(1)).buildEmailTemplate(any());
        verify(amazonEmailService, times(1)).sendEmail(any());
    }

    @Test
    void GivenValid_WhenSendRejectSupplierEmail_ThenExpectAmazonEmailServiceToBeCalled() {
        // Given
        String url = "http://example.com";
        String[] toAddress = {"to@example.com"};
        String language = "en";
        String receiverName = "John Doe";
        String supplierName = "ACME Corporation";
        String reason = "Just because";
        String htmlContent = "<html><body><h1>Test Content</h1></body></html>";

        when(mailTemplateBuilder.buildEmailTemplate(any())).thenReturn(htmlContent);
        when(amazonEmailService.sendEmail(any())).thenReturn(null);

        // When
        emailService.sendRejectSupplierEmail(url, toAddress, language, receiverName, supplierName, reason);

        // Then
        verify(mailTemplateBuilder, times(1)).buildEmailTemplate(any());
        verify(amazonEmailService, times(1)).sendEmail(any());
    }

    @Test
    void GivenValid_WhenSendEmail_ThenExpectAmazonEmailServiceToBeCalled() {
        // Given
        String fromAddr = "from@example.com";
        String[] toAddr = {"to@example.com"};
        String subject = "Test Subject";
        String htmlContent = "<html><body><h1>Hello</h1></body></html>";
        String textContent = "Hello";

        SendEmailRequest expectedRequest = new SendEmailRequest()
                .withDestination(new Destination().withToAddresses(toAddr))
                .withMessage(new Message()
                        .withBody(new Body()
                                .withHtml(new Content().withCharset(EmailServiceImpl.UTF_8).withData(htmlContent))
                                .withText(new Content().withCharset(EmailServiceImpl.UTF_8).withData(textContent)))
                        .withSubject(new Content().withCharset(EmailServiceImpl.UTF_8).withData(subject)))
                .withSource(fromAddr);

        // When
        emailService.sendEmail(fromAddr, toAddr, subject, htmlContent, textContent);

        // Then
        verify(amazonEmailService).sendEmail(expectedRequest);
    }

    @Test
    void GivenValidInformation_WhenSendApproveOfferEmail_ThenExpectAmazonEmailServiceToBeCalled() {
        // Given
        String url = "http://example.com";
        String[] toAddress = {"to@example.com"};
        String language = "en";
        String receiverName = "John Doe";
        String supplierName = "ACME Corporation";
        String htmlContent = "<html><body><h1>Test Content</h1></body></html>";
        when(mailTemplateBuilder.buildEmailTemplate(any())).thenReturn(htmlContent);
        when(amazonEmailService.sendEmail(any())).thenReturn(null);
        // When
        emailService.sendApproveOfferEmail(url, toAddress, language, receiverName, supplierName);
        // Then
        verify(mailTemplateBuilder, times(1)).buildEmailTemplate(any());
        verify(amazonEmailService, times(1)).sendEmail(any());
    }

    @Test
    void GivenValidInformation_WhenSendOfferRejectedEmail_ThenExpectAmazonEmailServiceToBeCalled() {
        // Given
        String url = "http://example.com";
        String[] toAddress = {"email@domain.com"};
        String language = "en";
        String reason = "Rejection reason";
        String supplierName = "ACME Corporation";
        String htmlContent = "<html><body><h1>Test Content</h1></body></html>";
        when(mailTemplateBuilder.buildEmailTemplate(any())).thenReturn(htmlContent);
        when(amazonEmailService.sendEmail(any())).thenReturn(null);
        // When
        emailService.sendOfferRejectedEmail(url, toAddress, language, reason, supplierName);
        // Then
        verify(mailTemplateBuilder, times(1)).buildEmailTemplate(any());
        verify(amazonEmailService, times(1)).sendEmail(any());
    }

    @Test
    void GivenValidInformation_WhenSendInviteSupplierEmail_ThenExpectAmazonEmailServiceToBeCalled() {
        // Given
        String url = "http://example.com";
        String toAddress = "to@example.com";
        String language = "en";
        String tenandName = "Iasi";
        String message = "Test message";
        String htmlContent = "<html><body><h1>Test Content</h1></body></html>";
        when(mailTemplateBuilder.buildEmailTemplate(any())).thenReturn(htmlContent);
        when(amazonEmailService.sendEmail(any())).thenReturn(null);
        // When
        emailService.sendSupplierInviteEmail(url, language, tenandName, toAddress, message);
        
        // Then
        verify(mailTemplateBuilder, times(1)).buildEmailTemplate(any());
        verify(amazonEmailService, times(1)).sendEmail(any());
    }

    @Test
    void sendEmail_MessageRejected() {
        // Given
        String fromAddr = "from@example.com";
        String[] toAddr = {"to@example.com"};
        String subject = "Test Subject";
        String htmlContent = "<html><body><h1>Hello</h1></body></html>";
        String textContent = "Hello";

        doThrow(MessageRejectedException.class).when(amazonEmailService).sendEmail(any(SendEmailRequest.class));

        // When
        emailService.sendEmail(fromAddr, toAddr, subject, htmlContent, textContent);
    }

    @Test
    void GivenValidInformation_WhenSendAccountConfirmationEmail_ThenExpectAmazonEmailServiceToBeCalled() {
        // Given
        String url = "http://example.com";
        String toAddress = "to@example.com";
        String language = "en";
        String tenantName = "Iasi";
        String message = "Test message";
        String htmlContent = "<html><body><h1>Test Content</h1></body></html>";
        when(mailTemplateBuilder.buildEmailTemplate(any())).thenReturn(htmlContent);
        when(amazonEmailService.sendEmail(any())).thenReturn(null);
        // When
        emailService.sendConfirmAccountEmail(url, language, tenantName, toAddress);

        // Then
        verify(mailTemplateBuilder, times(1)).buildEmailTemplate(any());
        verify(amazonEmailService, times(1)).sendEmail(any());
    }

    @Test
    void GivenValidInformation_WhenSendSetPasswordEmail_ThenExpectAmazonEmailServiceToBeCalled() {
        //Given
        String url = "http://example.com";
        String toAddress = "to@example.com";
        String language = "en";
        String htmlContent = "<html><body><h1>Test Content</h1></body></html>";
        when(mailTemplateBuilder.buildEmailTemplate(any())).thenReturn(htmlContent);
        when(amazonEmailService.sendEmail(any())).thenReturn(null);

        // When
        emailService.sendEmailAfterUserCreated(url, language, toAddress);

        // Then
        verify(mailTemplateBuilder, times(1)).buildEmailTemplate(any());
        verify(amazonEmailService, times(1)).sendEmail(any());
    }

}
