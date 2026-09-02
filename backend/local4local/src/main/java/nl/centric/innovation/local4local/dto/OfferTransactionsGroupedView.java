package nl.centric.innovation.local4local.dto;

import nl.centric.innovation.local4local.entity.OfferType;

public interface OfferTransactionsGroupedView {
    String getOfferTitle();

    String getSupplierName();

    Double getAmount();

    OfferType getOfferType();

    String getCreatedDate();
}
