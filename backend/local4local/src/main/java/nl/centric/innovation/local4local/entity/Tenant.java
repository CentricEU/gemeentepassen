package nl.centric.innovation.local4local.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import nl.centric.innovation.local4local.dto.TenantDto;
import org.javers.core.metamodel.annotation.DiffIgnore;

import java.math.BigDecimal;
import java.util.List;

/**
 * @DiffIgnore is used to ignore the suppliers field when comparing Tenant entities with JaVers,
 * as it can lead to performance issues (lazy issues) and is not relevant for most comparisons of Tenant entities.
 */

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(schema = "l4l_security", name = "tenants")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Tenant extends BaseEntity {

    private static final long serialVersionUID = 1L;

    @Column(name = "name")
    private String name;

    @Column(name = "address")
    private String address;

    @Column(name = "iban")
    private String iban;

    @Column(name = "bic")
    private String bic;

    @Column(name = "wage", precision = 10, scale = 20)
    private BigDecimal wage;

    @OneToMany(mappedBy = "tenant")
    @JsonIgnore
    @DiffIgnore
    private List<Supplier> suppliers;

    @Column(name = "email")
    private String email;

    @Column(name = "phone")
    private String phone;

    @Column(name = "logo")
    private byte[] logo;

    public static Tenant tenantDtoToEntity(TenantDto tenant) {
        return Tenant.builder()
                .name(tenant.name())
                .wage(tenant.wage())
                .address(tenant.address())
                .email(tenant.email())
                .phone(tenant.phone())
                .build();
    }

}
