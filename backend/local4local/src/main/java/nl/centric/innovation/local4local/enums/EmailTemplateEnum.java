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
    SET_PASSWORD("setPassword");


    private final String template;

    EmailTemplateEnum(String template) {
        this.template = template;
    }

    public String getTemplate() {
        return template;
    }
}
