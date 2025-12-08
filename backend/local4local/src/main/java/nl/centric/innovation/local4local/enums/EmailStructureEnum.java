package nl.centric.innovation.local4local.enums;

public enum EmailStructureEnum {

    SUBJECT("subject"),
    TITLE("title"),
    CONTENT("content"),
    ACTION("action"),
    BUTTON("button"),
    CLOSING("closing"),
    THANK_YOU("thankYou"),
    REGISTER_BTN("registerBtn"),
    CONFIRM_BTN("confirmBtn"),
    ACCOUNT_CONFIRMATION("accountConfirmation"),
    GO_TO("goTo"),
    GENERIC("generic"),
    LOGO_IMAGE("logoImage"),
    URL("url"),
    BTN_TEXT("btnText"),
    APPROVE("contentApprove"),
    REJECT("contentReject"),
    SUPPLIER_NAME("supplier"),
    REPRESENTATIVE_NAME("name"),
    REASON("reason"),
    TENANT_NAME("tenantName"),
    TENANT_TELEPHONE("tenantTelephone"),
    TENANT_WEBSITE("tenantWebsite"),
    TENANT_EMAIL("tenantEmail"),
    END_NOTE("endNote");

    private final String structure;

    EmailStructureEnum(String template) {
        this.structure = template;
    }

    public String getStructure() {
        return structure;
    }
}
