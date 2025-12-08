package nl.centric.innovation.local4local.service.impl;


import com.amazonaws.services.simpleemail.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.centric.innovation.local4local.enums.AssetsEnum;
import nl.centric.innovation.local4local.enums.EmailHtmlEnum;
import nl.centric.innovation.local4local.enums.EmailStructureEnum;
import nl.centric.innovation.local4local.enums.EmailTemplateEnum;
import nl.centric.innovation.local4local.util.MailTemplate;
import nl.centric.innovation.local4local.service.interfaces.EmailService;
import nl.centric.innovation.local4local.util.MailUtils;
import nl.centric.innovation.local4local.util.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
@PropertySource({"classpath:application.properties"})
public class EmailServiceImpl implements EmailService {

    @Value("${local4local.default.email.sender}")
    private String emailSender;

    @Value("${local4local.server.name}")
    private String baseURL;

    private final MailTemplateBuilderImpl mailTemplateBuilder;

    private final MailUtils mailUtils;

    public void sendProfileCreatedEmail(String url, String[] toAddress, String language, String receiverName, String supplierName, String repName) {
        MailTemplate mailTemplate = getSetupProfileTemplate(language, url, EmailTemplateEnum.SETUP_PROFILE.getTemplate(), receiverName + EmailHtmlEnum.EXCL.getTag(), supplierName, repName);
        String htmlContent = mailTemplateBuilder.buildEmailTemplate(mailTemplate);
        String textContent = mailUtils.buildTemplateText(mailTemplate);
        mailUtils.sendEmail(emailSender, toAddress, mailTemplate.getSubject(), htmlContent, textContent.toString());
    }

    public void sendOfferReviewEmail(String url, String[] toAddress, String language, String receiverName, String supplierName, String repName) {
        MailTemplate mailTemplate = getReviewOfferTemplate(language, url, EmailTemplateEnum.OFFER_REVIEW.getTemplate(), receiverName + EmailHtmlEnum.EXCL.getTag(), supplierName, repName);
        String htmlContent = mailTemplateBuilder.buildEmailTemplate(mailTemplate);
        String textContent = mailUtils.buildTemplateText(mailTemplate);
        mailUtils.sendEmail(emailSender, toAddress, mailTemplate.getSubject(), htmlContent, textContent.toString());
    }

    public void sendApproveProfileEmail(String url, String[] toAddress, String language, String receiverName, String municipalityName) {
        MailTemplate mailTemplate = getApproveProfileTemplate(language, url, EmailTemplateEnum.APPROVE_PROFILE.getTemplate(), receiverName + EmailHtmlEnum.EXCL.getTag(), municipalityName);
        String htmlContent = mailTemplateBuilder.buildEmailTemplate(mailTemplate);
        String textContent = mailUtils.buildTemplateText(mailTemplate);
        mailUtils.sendEmail(emailSender, toAddress, mailTemplate.getSubject(), htmlContent, textContent.toString());
    }

    public void sendNoCategoryEmail(String url, String toAddress, String language, String message) {
        MailTemplate mailTemplate = getNoCitizenGroupTemplate(language, url, EmailTemplateEnum.NO_CATEGORY.getTemplate(), message);
        String htmlContent = mailTemplateBuilder.buildEmailTemplate(mailTemplate);
        String textContent = mailUtils.buildTemplateText(mailTemplate);
        mailUtils.sendEmail(emailSender, new String[]{toAddress}, mailTemplate.getSubject(), htmlContent, textContent.toString());
    }

    @Override
    public void sendRejectSupplierEmail(String url, String[] toAddress, String language, String receiverName, String municipalityName, String reason) {
        MailTemplate mailTemplate = getRejectSupplierTemplate(language, url, EmailTemplateEnum.REJECT_SUPPLIER.getTemplate(), receiverName + EmailHtmlEnum.EXCL.getTag(), municipalityName, reason);
        String htmlContent = mailTemplateBuilder.buildEmailTemplate(mailTemplate);
        String textContent = mailUtils.buildTemplateText(mailTemplate);

        mailUtils.sendEmail(emailSender, toAddress, mailTemplate.getSubject(), htmlContent, textContent.toString());
    }

    public void sendApproveOfferEmail(String url, String[] toAddress, String language, String receiverName, String municipalityName) {
        MailTemplate mailTemplate = getApprovedOfferEmail(language, url, EmailTemplateEnum.APPROVED_OFFER.getTemplate(), receiverName + EmailHtmlEnum.EXCL.getTag(), municipalityName);
        String htmlContent = mailTemplateBuilder.buildEmailTemplate(mailTemplate);
        String textContent = mailUtils.buildTemplateText(mailTemplate);
        mailUtils.sendEmail(emailSender, toAddress, mailTemplate.getSubject(), htmlContent, textContent.toString());
    }

    @Override
    public void sendOfferRejectedEmail(String url, String[] toAddress, String language, String reason, String supplierName) {
        MailTemplate mailTemplate = getRejectedOfferEmail(language, url, EmailTemplateEnum.REJECTED_OFFER.getTemplate(), supplierName + EmailHtmlEnum.EXCL.getTag(), reason);
        String htmlContent = mailTemplateBuilder.buildEmailTemplate(mailTemplate);
        String textContent = mailUtils.buildTemplateText(mailTemplate);
        mailUtils.sendEmail(emailSender, toAddress, mailTemplate.getSubject(), htmlContent, textContent.toString());
    }

    public void sendEmailAfterCashierCreated(String url, String language, String toAddress) {
        MailTemplate mailTemplate = getEmailAfterCashierCreated(language, url, EmailTemplateEnum.CASHIER_SET_PASSWORD.getTemplate());
        String htmlContent = mailTemplateBuilder.buildEmailTemplate(mailTemplate);
        String textContent = mailUtils.buildTemplateText(mailTemplate);
        mailUtils.sendEmail(emailSender, new String[]{toAddress}, mailTemplate.getSubject(), htmlContent, textContent.toString());
    }

    public void sendSupplierInviteEmail(String url, String language, String tenantName, String toAddress, String message) {
        MailTemplate mailTemplate = getSupplierInviteEmail(language, url, EmailTemplateEnum.SUPPLIER_INVITE.getTemplate(), tenantName, message);
        String htmlContent = mailTemplateBuilder.buildEmailTemplate(mailTemplate);
        String textContent = mailUtils.buildTemplateText(mailTemplate);
        mailUtils.sendEmail(emailSender, new String[]{toAddress}, mailTemplate.getSubject(), htmlContent, textContent.toString());
    }

    public void sendPasswordRecoveryEmail(String url, String[] toAddress, String language) {
        MailTemplate mailTemplate = getPasswordRecoveryTemplate(language, url, EmailTemplateEnum.PASSWORD_RECOVER.getTemplate(), "");
        String htmlContent = mailTemplateBuilder.buildEmailTemplate(mailTemplate);
        String textContent = mailUtils.buildTemplateText(mailTemplate);
        mailUtils.sendEmail(emailSender, toAddress, mailTemplate.getSubject(), htmlContent, textContent.toString());
    }

    public void sendConfirmAccountEmail(String url, String language, String tenantName, String toAddress) {
        MailTemplate mailTemplate = getConfirmAccountEmail(language, url, EmailTemplateEnum.ACCOUNT_CONFIRMATION.getTemplate(), tenantName + EmailHtmlEnum.EXCL.getTag());
        String htmlContent = mailTemplateBuilder.buildEmailTemplate(mailTemplate);
        String textContent = mailUtils.buildTemplateText(mailTemplate);
        mailUtils.sendEmail(emailSender, new String[]{toAddress}, mailTemplate.getSubject(), htmlContent, textContent.toString());
    }

    @Override
    public void sendEmailAfterUserCreated(String url, String language, String toAddress) {
        MailTemplate mailTemplate = getEmailAfterUserCreated(language, url, EmailTemplateEnum.SET_PASSWORD.getTemplate());
        String htmlContent = mailTemplateBuilder.buildEmailTemplate(mailTemplate);
        String textContent = mailUtils.buildTemplateText(mailTemplate);
        mailUtils.sendEmail(emailSender, new String[]{toAddress}, mailTemplate.getSubject(), htmlContent, textContent.toString());
    }

    private MailTemplate getEmailAfterUserCreated(String language, String url, String templateMiddlePart) {
        Locale locale = new Locale(language);
        MailTemplate mailTemplate = buildGenericTemplate(locale, language, url, templateMiddlePart, "");

        String content = getContentForSetPassword(locale, templateMiddlePart);
        String btnText = mailUtils.getEmailStringText(locale, EmailTemplateEnum.SET_PASSWORD.getTemplate(), EmailStructureEnum.CONFIRM_BTN.getStructure());

        mailTemplate.setContent(content);
        mailTemplate.setBtnText(btnText);

        return mailTemplate;
    }

    private MailTemplate getEmailAfterCashierCreated(String language, String url, String templateMiddlePart) {
        Locale locale = new Locale(language);
        MailTemplate mailTemplate = buildGenericTemplate(locale, language, url, templateMiddlePart, "");

        String content = getContentForSetPassword(locale, templateMiddlePart);
        String btnText = mailUtils.getEmailStringText(locale, EmailTemplateEnum.CASHIER_SET_PASSWORD.getTemplate(), EmailStructureEnum.CONFIRM_BTN.getStructure());

        mailTemplate.setContent(content);
        mailTemplate.setBtnText(btnText);
        return mailTemplate;
    }


    private MailTemplate getNoCitizenGroupTemplate(String language, String url, String templateMiddlePart, String message) {
        Locale locale = new Locale(language);
        MailTemplate mailTemplate = buildGenericTemplate(locale, language, url, templateMiddlePart, "");

        mailTemplate.setContent(message);

        return mailTemplate;
    }


    private MailTemplate getSetupProfileTemplate(String language, String url, String templateMiddlePart, String receiverName, String supplierName, String repName) {
        Locale locale = new Locale(language);
        MailTemplate mailTemplate = buildGenericTemplate(locale, language, url, templateMiddlePart, receiverName);

        String content = getContentForSetupProfile(locale, templateMiddlePart, supplierName, repName);
        mailTemplate.setContent(content);

        return mailTemplate;
    }

    private MailTemplate getReviewOfferTemplate(String language, String url, String templateMiddlePart, String receiverName, String supplierName, String repName) {
        Locale locale = new Locale(language);
        MailTemplate mailTemplate = buildGenericTemplate(locale, language, url, templateMiddlePart, receiverName);

        String content = getContentForReviewOffer(locale, templateMiddlePart, supplierName, repName);
        mailTemplate.setContent(content);

        return mailTemplate;
    }

    private MailTemplate getApproveProfileTemplate(String language, String url, String templateMiddlePart, String receiverName, String municipalityName) {
        Locale locale = new Locale(language);
        MailTemplate mailTemplate = buildGenericTemplate(locale, language, url, templateMiddlePart, receiverName);

        String content = getContentForApproveProfile(locale, templateMiddlePart, municipalityName);
        mailTemplate.setContent(content);

        return mailTemplate;
    }

    private MailTemplate getApprovedOfferEmail(String language, String url, String templateMiddlePart, String receiverName, String municipalityName) {
        Locale locale = new Locale(language);
        MailTemplate mailTemplate = buildGenericTemplate(locale, language, url, templateMiddlePart, receiverName);

        String content = getContentForApprovedOffer(locale, templateMiddlePart, municipalityName);
        mailTemplate.setContent(content);

        return mailTemplate;
    }

    private MailTemplate getRejectedOfferEmail(String language, String url, String templateMiddlePart, String supplierName, String reason) {
        Locale locale = new Locale(language);
        MailTemplate mailTemplate = buildGenericTemplate(locale, language, url, templateMiddlePart, supplierName);

        String content = getContentForRejectedOffer(locale, templateMiddlePart, reason);
        mailTemplate.setContent(content);

        return mailTemplate;
    }

    private MailTemplate getSupplierInviteEmail(String language, String url, String templateMiddlePart, String tenantName, String message) {
        Locale locale = new Locale(language);
        MailTemplate mailTemplate = buildGenericTemplate(locale, language, url, templateMiddlePart, "");
        String closing = mailUtils.getEmailStringText(locale, EmailStructureEnum.GENERIC.getStructure(), EmailStructureEnum.THANK_YOU.getStructure());
        String btnText = mailUtils.getEmailStringText(locale, EmailStructureEnum.GENERIC.getStructure(), EmailStructureEnum.REGISTER_BTN.getStructure());

        mailTemplate.setClosing(closing + tenantName);
        mailTemplate.setAction(null);
        mailTemplate.setBtnText(btnText);
        mailTemplate.setContent(message);

        return mailTemplate;
    }


    private MailTemplate getRejectSupplierTemplate(String language, String url, String templateMiddlePart, String receiverName, String municipalityName, String reason) {
        Locale locale = new Locale(language);
        MailTemplate mailTemplate = buildGenericTemplate(locale, language, url, templateMiddlePart, receiverName);

        String content = getContentForRejectSupplier(locale, templateMiddlePart, municipalityName, reason);
        mailTemplate.setContent(content);

        return mailTemplate;
    }

    private MailTemplate getPasswordRecoveryTemplate(String language, String url, String templateMiddlePart, String receiverName) {
        Locale locale = new Locale(language);
        MailTemplate mailTemplate = buildGenericTemplate(locale, language, url, templateMiddlePart, receiverName);

        String content = mailUtils.getEmailStringText(locale, templateMiddlePart, EmailStructureEnum.CONTENT.getStructure()).replace(EmailHtmlEnum.LINE_BREAK.getTag(), EmailHtmlEnum.RN.getTag());
        mailTemplate.setContent(content);

        return mailTemplate;
    }

    private MailTemplate getConfirmAccountEmail(String language, String url, String templateMiddlePart, String receiverName) {
        Locale locale = new Locale(language);
        MailTemplate mailTemplate = buildGenericTemplate(locale, language, url, templateMiddlePart, receiverName);

        String content = mailUtils.getEmailStringText(locale, templateMiddlePart, EmailStructureEnum.CONTENT.getStructure()).replace(EmailHtmlEnum.LINE_BREAK.getTag(), EmailHtmlEnum.RN.getTag());
        String btnText = mailUtils.getEmailStringText(locale, EmailStructureEnum.ACCOUNT_CONFIRMATION.getStructure(), EmailStructureEnum.CONFIRM_BTN.getStructure());
        mailTemplate.setContent(content);
        mailTemplate.setBtnText(btnText);

        return mailTemplate;
    }

    private MailTemplate buildGenericTemplate(Locale locale, String language, String url, String templateMiddlePart, String receiverName) {
        String logoImage = baseURL + AssetsEnum.LOCAL_LOGO.getPath();
        String title = StringUtils.addStringBeforeAndAfter(EmailHtmlEnum.BOLD_START.getTag(), mailUtils.getEmailStringText(locale, templateMiddlePart, EmailStructureEnum.TITLE.getStructure(), receiverName), EmailHtmlEnum.BOLD_END.getTag());
        String subject = mailUtils.getEmailStringText(locale, templateMiddlePart, EmailStructureEnum.SUBJECT.getStructure());
        String action = mailUtils.getEmailStringText(locale, templateMiddlePart, EmailStructureEnum.ACTION.getStructure());
        String btnText = mailUtils.getEmailStringText(locale, EmailStructureEnum.GO_TO.getStructure(), EmailStructureEnum.BUTTON.getStructure());
        String closing = mailUtils.getEmailStringText(locale, EmailStructureEnum.GENERIC.getStructure(), EmailStructureEnum.CLOSING.getStructure());

        return MailTemplate.builder()
                .locale(locale)
                .logoImage(logoImage)
                .title(title)
                .url(url)
                .subject(subject)
                .action(action)
                .btnText(btnText)
                .closing(closing)
                .build();
    }

    private String getContentForSetPassword(Locale locale, String templateMiddlePart) {
        return mailUtils.getEmailStringText(locale, templateMiddlePart, EmailStructureEnum.CONTENT.getStructure(), "").replace(EmailHtmlEnum.LINE_BREAK.getTag(), EmailHtmlEnum.RN.getTag());
    }

    private String getContentForSetupProfile(Locale locale, String templateMiddlePart, String supplierName, String repName) {
        String contentInfo = mailUtils.getEmailStringText(locale, templateMiddlePart, EmailStructureEnum.CONTENT.getStructure()).replace(EmailHtmlEnum.LINE_BREAK.getTag(), EmailHtmlEnum.RN.getTag());
        String supplier = StringUtils.addStringBeforeAndAfter(EmailHtmlEnum.P_START.getTag(), mailUtils.getEmailStringText(locale, templateMiddlePart, EmailStructureEnum.SUPPLIER_NAME.getStructure(), supplierName), EmailHtmlEnum.P_END.getTag());
        String name = StringUtils.addStringBeforeAndAfter(EmailHtmlEnum.P_START.getTag(), mailUtils.getEmailStringText(locale, templateMiddlePart, EmailStructureEnum.REPRESENTATIVE_NAME.getStructure(), repName), EmailHtmlEnum.P_END.getTag());
        return StringUtils.joinStringPieces(contentInfo, supplier, name);
    }

    private String getContentForReviewOffer(Locale locale, String templateMiddlePart, String supplierName, String repName) {
        String contentInfo = mailUtils.getEmailStringText(locale, templateMiddlePart, EmailStructureEnum.CONTENT.getStructure()).replace(EmailHtmlEnum.LINE_BREAK.getTag(), EmailHtmlEnum.RN.getTag());
        String supplier = StringUtils.addStringBeforeAndAfter(EmailHtmlEnum.P_START.getTag(), mailUtils.getEmailStringText(locale, templateMiddlePart, EmailStructureEnum.SUPPLIER_NAME.getStructure(), supplierName), EmailHtmlEnum.P_END.getTag());
        String name = StringUtils.addStringBeforeAndAfter(EmailHtmlEnum.P_START.getTag(), mailUtils.getEmailStringText(locale, templateMiddlePart, EmailStructureEnum.REPRESENTATIVE_NAME.getStructure(), repName), EmailHtmlEnum.P_END.getTag());
        return StringUtils.joinStringPieces(contentInfo, supplier, name);
    }

    private String getContentForApproveProfile(Locale locale, String templateMiddlePart, String municipalityName) {
        String contentInfo = mailUtils.getEmailStringText(locale, templateMiddlePart, EmailStructureEnum.CONTENT.getStructure(), municipalityName).replace(EmailHtmlEnum.LINE_BREAK.getTag(), EmailHtmlEnum.RN.getTag());
        String approveText = StringUtils.addStringBeforeAndAfter(EmailHtmlEnum.P_START.getTag(), mailUtils.getEmailStringText(locale, templateMiddlePart, EmailStructureEnum.APPROVE.getStructure()), EmailHtmlEnum.P_END.getTag());
        return StringUtils.joinStringPieces(contentInfo, approveText);
    }

    private String getContentForApprovedOffer(Locale locale, String templateMiddlePart, String municipalityName) {
        return mailUtils.getEmailStringText(locale, templateMiddlePart, EmailStructureEnum.CONTENT.getStructure(), municipalityName).replace(EmailHtmlEnum.LINE_BREAK.getTag(), EmailHtmlEnum.RN.getTag());
    }

    private String getContentForRejectedOffer(Locale locale, String templateMiddlePart, String reason) {
        String contentInfo = mailUtils.getEmailStringText(locale, templateMiddlePart, EmailStructureEnum.CONTENT.getStructure()).replace(EmailHtmlEnum.LINE_BREAK.getTag(), EmailHtmlEnum.RN.getTag());
        String rejectionText = StringUtils.addStringBeforeAndAfter(EmailHtmlEnum.P_START.getTag(), mailUtils.getEmailStringText(locale, templateMiddlePart, EmailStructureEnum.REASON.getStructure(), reason), EmailHtmlEnum.P_END.getTag());
        return StringUtils.joinStringPieces(contentInfo, rejectionText);
    }

    private String getContentForRejectSupplier(Locale locale, String templateMiddlePart, String municipalityName, String reason) {
        String contentInfo = mailUtils.getEmailStringText(locale, templateMiddlePart, EmailStructureEnum.CONTENT.getStructure(), municipalityName).replace(EmailHtmlEnum.LINE_BREAK.getTag(), EmailHtmlEnum.RN.getTag());
        String rejectText = StringUtils.addStringBeforeAndAfter(EmailHtmlEnum.P_START.getTag(), mailUtils.getEmailStringText(locale, templateMiddlePart, EmailStructureEnum.REJECT.getStructure(), reason), EmailHtmlEnum.P_END.getTag());
        return StringUtils.joinStringPieces(contentInfo, rejectText);
    }
}
