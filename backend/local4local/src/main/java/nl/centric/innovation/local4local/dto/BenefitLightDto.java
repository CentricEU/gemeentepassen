package nl.centric.innovation.local4local.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import nl.centric.innovation.local4local.entity.Benefit;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BenefitLightDto {

    @NonNull
    private UUID id;
    @NonNull
    private String name;
    @NonNull
    private String description;
    @NonNull
    private LocalDate startDate;
    @NonNull
    private LocalDate expirationDate;

    public static BenefitLightDto entityToBenefitTableDto(Benefit benefit) {
        return BenefitLightDto.builder()
                .id(benefit.getId())
                .name(benefit.getName())
                .description(benefit.getDescription())
                .startDate(benefit.getStartDate())
                .expirationDate(benefit.getExpirationDate())
                .build();
    }
}
