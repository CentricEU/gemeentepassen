package nl.centric.innovation.local4local.enums;

public enum EmailTemplateEnum {

    SETUP_PROFILE("profileCreate"),
    APPROVE_PROFILE("profileAccepted"),
    REJECT_SUPPLIER("rejectSupplier"),
    PASSWORD_RECOVER("passwordRecover"),
    OFFER_REVIEW("offerReview"),
    APPROVED_OFFER("offerApproved"),
    REJECTED_OFFER("offerRejected"),
    SUPPLIER_INVITE("supplierInvite"),
    ACCOUNT_CONFIRMATION("accountConfirmation"),
    SET_PASSWORD("setPassword"),
    CASHIER_SET_PASSWORD("cashierSetPassword"),
    NO_CATEGORY("noCategory"),
    SUMMARY_EMAIL_AFTER_APPLY_FOR_PASS("applyForPassSummary");


    private final String template;

    EmailTemplateEnum(String template) {
        this.template = template;
    }

    public String getTemplate() {
        return template;
    }
}
