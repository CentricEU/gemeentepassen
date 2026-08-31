package nl.centric.innovation.local4local.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import nl.centric.innovation.local4local.dto.CitizenGroupDto;
import nl.centric.innovation.local4local.enums.CitizenAgeGroup;
import nl.centric.innovation.local4local.enums.EligibilityCriteria;
import nl.centric.innovation.local4local.enums.RequiredDocuments;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.Type;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;

@Entity
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(schema = "l4l_global", name = "citizen_group")
public class CitizenGroup extends BaseEntity {
    @Column(name = "group_name", nullable = false, unique = true)
    private String groupName;

    @Column(name = "age_group")
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.ARRAY)
    private CitizenAgeGroup[] ageGroup;

    @Column(name = "includes_dependent_children", nullable = false)
    private boolean dependentChildrenIncluded;

    @Column(name = "threshold_amount", nullable = false, precision = 5, scale = 2)
    private BigDecimal thresholdAmount;

    @Column(name = "max_income", nullable = false, precision = 10, scale = 2)
    private BigDecimal maxIncome;

    @Column(name = "eligibility_criteria")
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.ARRAY)
    private EligibilityCriteria[] eligibilityCriteria;

    @Column(name = "required_documents")
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.ARRAY)
    private RequiredDocuments[] requiredDocuments;

    @Column(name = "tenant_id")
    private UUID tenantId;

    @ManyToMany(mappedBy = "citizenGroups")
    private Set<Benefit> benefits;


    public static CitizenGroup fromDto(CitizenGroupDto citizenGroupDto, UUID tenantId) {
        return CitizenGroup.builder()
                .groupName(citizenGroupDto.groupName())
                .ageGroup(citizenGroupDto.ageGroup())
                .dependentChildrenIncluded(citizenGroupDto.isDependentChildrenIncluded())
                .thresholdAmount(citizenGroupDto.thresholdAmount())
                .maxIncome(citizenGroupDto.maxIncome())
                .eligibilityCriteria(citizenGroupDto.eligibilityCriteria())
                .requiredDocuments(citizenGroupDto.requiredDocuments())
                .tenantId(tenantId)
                .build();
    }
}
