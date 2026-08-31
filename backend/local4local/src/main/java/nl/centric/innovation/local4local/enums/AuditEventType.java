package nl.centric.innovation.local4local.enums;

import lombok.Getter;

@Getter
public enum AuditEventType {
    APPLICATION_CREATED,
    APPLICATION_CONFIRMED,
    APPLICATION_SUBMITTED,
    APPLICATION_REJECTED,
    APPLICATION_APPROVED,
    APPLICATION_APPROVED_WITH_EDITS,
    INFORMATION_EDITED,
}

