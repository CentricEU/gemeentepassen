package nl.centric.innovation.local4local.dto;

import java.math.BigDecimal;

public interface OfferTransactionTableView {
    String getPassNumber();
    String getCitizenName();
    BigDecimal getAmount();
    String getCreatedDate();
    String getCreatedTime();
}
