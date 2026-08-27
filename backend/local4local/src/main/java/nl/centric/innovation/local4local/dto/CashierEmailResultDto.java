package nl.centric.innovation.local4local.dto;


import java.util.Set;

public record CashierEmailResultDto(Set<String> newEmails, Set<String> deletedEmails) {}
