package nl.centric.innovation.local4local.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
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

    @OneToMany(mappedBy = "tenant")
    @JsonIgnore
    private List<Supplier> suppliers;

}
