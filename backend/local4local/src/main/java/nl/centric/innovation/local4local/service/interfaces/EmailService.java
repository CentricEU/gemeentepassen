package nl.centric.innovation.local4local.service.interfaces;


public interface EmailService {
    void sendProfileCreatedEmail(String url, String[] toAddress, String language, String receiverName, String supplierName, String repName);

    void sendApproveProfileEmail(String url, String[] toAddress, String language, String receiverName, String municipalityName);

    void sendRejectSupplierEmail(String url, String[] toAddress, String language, String receiverName, String municipalityName, String reason);

    void sendPasswordRecoveryEmail(String url, String[] toAddress, String language);

    void sendOfferReviewEmail(String url, String[] toAddress, String language, String receiverName, String supplierName, String repName);

    void sendApproveOfferEmail(String url, String[] toAddress, String language, String receiverName, String municipalityName);

    void sendOfferRejectedEmail(String url, String[] toAddress, String language, String reason, String supplierName);

    void sendSupplierInviteEmail(String url, String language, String tenantName, String toAddress, String message);

    void sendConfirmAccountEmail(String url, String language, String username, String toAddress);

    void sendEmailAfterUserCreated(String url, String language, String toAddress);

    void sendNoCategoryEmail(String url, String toAddress, String language, String message);

    void sendEmailAfterCashierCreated(String url, String language, String toAddress);
}
