package nl.centric.innovation.local4local.enums;

import lombok.Getter;

@Getter
public enum OfferAttributeEnum {
    STATUS("status"),
    OFFER_TYPE("offerType"),
    OFFER_TYPE_ID("offerTypeId"),
    SUPPLIER("supplier"),
    ID("id"),
    IS_ACTIVE("isActive"),
    GRANTS("grants");

    private final String attributeName;

    OfferAttributeEnum(String attributeName) {
        this.attributeName = attributeName;
    }

}
