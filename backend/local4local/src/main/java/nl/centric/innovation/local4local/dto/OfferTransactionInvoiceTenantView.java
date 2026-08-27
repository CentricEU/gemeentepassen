package nl.centric.innovation.local4local.dto;

import nl.centric.innovation.local4local.entity.OfferTransaction;

public interface OfferTransactionInvoiceTenantView {
    String getSupplierIban();
    String getSupplierName();
    String getPassNumber();
    OfferTransaction getOfferTransaction();
}
