package nl.centric.innovation.local4local.dto;

import java.math.BigDecimal;

public interface OfferTransactionTenantTableView {
    String getPassNumber();
    String getCitizenName();
    BigDecimal getAmount();
    String getSupplierName();
    String getBenefit();
    String getCreatedDate();
    String getCreatedTime();
}