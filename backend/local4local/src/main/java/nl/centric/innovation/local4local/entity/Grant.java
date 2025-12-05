package nl.centric.innovation.local4local.entity;

import io.hypersistence.utils.hibernate.type.basic.PostgreSQLEnumType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import nl.centric.innovation.local4local.dto.GrantViewDto;
import nl.centric.innovation.local4local.enums.CreatedForEnum;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import java.time.LocalDate;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(schema = "l4l_global", name = "grants")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@TypeDef(name = "pgsql_enum", typeClass = PostgreSQLEnumType.class)
public class Grant extends BaseEntity {

    @Column(name = "title")
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "amount")
    private Integer amount;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "created_for")
    @Type(type = "pgsql_enum")
    private CreatedForEnum createFor;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "expiration_date")
    private LocalDate expirationDate;

    @ManyToOne
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    public static Grant grantViewDtoToEntity(GrantViewDto grantViewDto, Tenant tenant) {
        return Grant.builder()
                .title(grantViewDto.title())
                .amount(grantViewDto.amount())
                .createFor(grantViewDto.createFor())
                .description(grantViewDto.description())
                .startDate(grantViewDto.startDate())
                .expirationDate(grantViewDto.expirationDate())
                .tenant(tenant)
                .build();
    }
}
