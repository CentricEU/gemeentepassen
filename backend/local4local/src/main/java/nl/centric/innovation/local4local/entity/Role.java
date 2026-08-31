package nl.centric.innovation.local4local.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;


@Entity
@Table(schema = "l4l_security", name = "role")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Role implements GrantedAuthority {
    public static final String ROLE_MUNICIPALITY_ADMIN = "ROLE_MUNICIPALITY_ADMIN";
    public static final String ROLE_SUPPLIER = "ROLE_SUPPLIER";
    public static final String ROLE_CITIZEN = "ROLE_CITIZEN";
    public static final String ROLE_CASHIER = "ROLE_CASHIER";
    public static final String ROLE_SUPER_ADMIN = "ROLE_SUPER_ADMIN";

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false)
    private Integer id;
    @Column(name = "name")
    private String name;

    @Override
    public String getAuthority() {
        return getName();
    }
}
