package nl.centric.innovation.local4local.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import nl.centric.innovation.local4local.dto.BenefitRequestDto;
import nl.centric.innovation.local4local.enums.BenefitStatusEnum;
import org.hibernate.annotations.Type;

import javax.persistence.Entity;
import javax.persistence.Column;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.ManyToMany;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.Table;

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

@Entity
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(schema = "l4l_global", name = "benefit")
public class Benefit extends BaseEntity {
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "expiration_date", nullable = false)
    private LocalDate expirationDate;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name="amount", nullable = false)
    private Double amount;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "status")
    @Type(type = "pgsql_enum")
    private BenefitStatusEnum status;

    @ManyToMany()
    @JoinTable(schema = "l4l_global", name = "benefit_citizen_group",
            joinColumns = @JoinColumn(name = "benefit_id"),
            inverseJoinColumns = @JoinColumn(name = "citizen_group_id"))
    private Set<CitizenGroup> citizenGroups;

    public static Benefit fromBenefitRequestDtoToEntity(BenefitRequestDto benefitDto, UUID tenantId, Set<CitizenGroup> citizenGroups) {
        return Benefit.builder()
                .name(benefitDto.name())
                .description(benefitDto.description())
                .startDate(benefitDto.startDate())
                .expirationDate(benefitDto.expirationDate())
                .citizenGroups(citizenGroups)
                .tenantId(tenantId)
                .status(BenefitStatusEnum.ACTIVE)
                .amount(benefitDto.amount())
                .build();
    }
}
