package nl.centric.innovation.local4local.entity;

import io.hypersistence.utils.hibernate.type.array.EnumArrayType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import nl.centric.innovation.local4local.dto.CitizenGroupDto;
import nl.centric.innovation.local4local.enums.CitizenAgeGroup;
import nl.centric.innovation.local4local.enums.EligibilityCriteria;
import nl.centric.innovation.local4local.enums.RequiredDocuments;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;
import org.hibernate.annotations.TypeDefs;

import javax.persistence.Column;
import javax.persistence.Entity;

import javax.persistence.ManyToMany;
import javax.persistence.Table;
import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;

@Entity
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@TypeDefs({
        @TypeDef(
                name = "citizen_age_group_array",
                typeClass = EnumArrayType.class,
                parameters = {
                        @org.hibernate.annotations.Parameter(name = "enumClass", value = "nl.centric.innovation.local4local.enums.CitizenAgeGroup"),
                        @org.hibernate.annotations.Parameter(name = "sql_array_type", value = "l4l_global.age_group")
                }
        ),
        @TypeDef(
                name = "eligibility_criteria_array",
                typeClass = EnumArrayType.class,
                parameters = {
                        @org.hibernate.annotations.Parameter(name = "enumClass", value = "nl.centric.innovation.local4local.enums.EligibilityCriteria"),
                        @org.hibernate.annotations.Parameter(name = "sql_array_type", value = "l4l_global.eligibility_criteria")
                }
        ),
        @TypeDef(
                name = "required_documents_array",
                typeClass = EnumArrayType.class,
                parameters = {
                        @org.hibernate.annotations.Parameter(name = "enumClass", value = "nl.centric.innovation.local4local.enums.RequiredDocuments"),
                        @org.hibernate.annotations.Parameter(name = "sql_array_type", value = "l4l_global.required_documents")
                }
        )
})
@Table(schema = "l4l_global", name = "citizen_group")
public class CitizenGroup extends BaseEntity {
    @Column(name = "group_name", nullable = false, unique = true)
    private String groupName;

    @Type(type = "citizen_age_group_array")
    @Column(name = "age_group", columnDefinition = "l4l_global.age_group[]")
    private CitizenAgeGroup[] ageGroup;

    @Column(name = "includes_dependent_children", nullable = false)
    private boolean dependentChildrenIncluded;

    @Column(name = "threshold_amount", nullable = false, precision = 5, scale = 2)
    private BigDecimal thresholdAmount;

    @Column(name = "max_income", nullable = false, precision = 10, scale = 2)
    private BigDecimal maxIncome;

    @Type(type = "eligibility_criteria_array")
    @Column(name = "eligibility_criteria", columnDefinition = "l4l_global.eligibility_criteria[]")
    private EligibilityCriteria[] eligibilityCriteria;

    @Type(type = "required_documents_array")
    @Column(name = "required_documents", columnDefinition = "l4l_global.required_documents[]")
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
