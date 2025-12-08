package nl.centric.innovation.local4local.dto;

import lombok.Builder;
import nl.centric.innovation.local4local.entity.Pass;

import javax.validation.constraints.*;
import java.time.LocalDate;

@Builder
public record PassDto(
        @NotBlank(message = "First name is required")
        @Size(max = 64, message = "First name must not exceed 64 characters")
        String firstName,

        @NotBlank(message = "Last name is required")
        @Size(max = 64, message = "Last name must not exceed 64 characters")
        String lastName,

        @NotNull(message = "Birthday is required")
        LocalDate birthday,

        @NotBlank(message = "BSN is required")
        @Size(max = 9, message = "BSN must not exceed 9 characters")
        String bsn,

        @NotBlank(message = "Contact phone is required")
        @Size(max = 15, message = "Contact phone must not exceed 15 characters")
        String contactPhone,

        @NotBlank(message = "Contact email is required")
        @Email(message = "Contact email must be a valid email address")
        String contactEmail,

        @Size(max = 1024, message = "Additional info must not exceed 1024 characters")
        String additionalInfo
) {

    public static PassDto toDto(Pass pass) {
        return PassDto.builder()
                .firstName(pass.getFirstName())
                .lastName(pass.getLastName())
                .birthday(pass.getBirthday())
                .bsn(pass.getBsn())
                .contactPhone(pass.getContactPhone())
                .contactEmail(pass.getContactEmail())
                .additionalInfo(pass.getAdditionalInfo())
                .build();
    }
}
