package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import nl.centric.innovation.local4local.util.DateUtils;

import javax.validation.constraints.NotEmpty;
import java.time.LocalDateTime;

@Builder
public record TransactionDetailsDto(
        @NotEmpty String code,
        @NotEmpty String time,
        @NotEmpty String date) {

    public static TransactionDetailsDto of(String code, LocalDateTime createdDate) {
        return TransactionDetailsDto.builder()
                .code(code)
                .time(DateUtils.formatTime(createdDate.toLocalTime()))
                .date(DateUtils.formatDateDefault(createdDate.toLocalDate()))
                .build();
    }
}

