package nl.centric.innovation.local4local.enums;

public enum RejectionReason {
    NOT_IN_REGION("Not in region"),
    MISBEHAVIOR("Misbehaviour"),
    IDLE("Idle"),
    INCOMPLETE_INFORMATION("Incomplete information"),
    DUPLICATE("Duplicate");

    private final String reason;

    RejectionReason(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }
}
