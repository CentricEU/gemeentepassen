package nl.centric.innovation.local4local.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import java.time.LocalDate;

public record InvoiceDto(

        @NotEmpty(message = "Invoice Number is mandatory")
        @Pattern(regexp = "^[a-zA-Z0-9/-]+$", message = "Invoice Number must contain only digits, letters, '-' or '/'")
        String invoiceNumber,

        @NotNull(message = "Month is mandatory")
        LocalDate currentDate,

        @NotNull(message = "Issue Date is mandatory")
        LocalDate issueDate,

        @NotNull(message = "Due Date is mandatory")
        Integer dueDate
) {
    @JsonIgnore
    public LocalDate getFinalDueDate() {
        return issueDate.plusDays(dueDate);
    }
}
