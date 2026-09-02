package nl.centric.innovation.local4local.enums;

import lombok.Getter;

@Getter
public enum RejectionReason {
    NOT_IN_REGION("rejection.not_in_region"),
    MISBEHAVIOR("rejection.misbehavior"),
    IDLE("rejection.idle"),
    INCOMPLETE_INFORMATION("rejection.incomplete_information"),
    DUPLICATE("rejection.duplicate");

    private final String reason;

    RejectionReason(String reason) {
        this.reason = reason;
    }
}
