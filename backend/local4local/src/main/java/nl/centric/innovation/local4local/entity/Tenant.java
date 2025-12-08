package nl.centric.innovation.local4local.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import nl.centric.innovation.local4local.dto.TenantDto;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import java.util.List;

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

    @Column(name = "wage", precision = 10, scale = 20, nullable = false)
    private Double wage;

    @OneToMany(mappedBy = "tenant")
    @JsonIgnore
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
                .address(tenant.address())
                .build();
    }

}
