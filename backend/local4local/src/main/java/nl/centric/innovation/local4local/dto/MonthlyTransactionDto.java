package nl.centric.innovation.local4local.dto;

import lombok.Builder;

@Builder
public record MonthlyTransactionDto(Integer month, Double totalAmount) {
}
