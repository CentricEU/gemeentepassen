package nl.centric.innovation.local4local.dto;

import nl.centric.innovation.local4local.enums.AccountDeletionReason;

import java.util.List;

public record AccountDeletionReasonsDto(List<AccountDeletionReason> accountDeletionReasons) {
}
