package nl.centric.innovation.local4local.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import nl.centric.innovation.local4local.dto.CreateUserDto;
import org.javers.core.metamodel.annotation.DiffIgnore;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.Collection;
import java.util.Collections;
import java.util.UUID;


/**
 * @DiffIgnore is used to ignore the refreshToken & password fields when comparing User entities with JaVers,
 * because they are sensitive information that should not be included in comparisons.
 * Also, Role is ignored since it is not relevant for most comparisons of User entities.
 */


@EqualsAndHashCode(callSuper = true)
@Entity
@Table(schema = "l4l_security", name = "user")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class User extends BaseEntity implements UserDetails {

    private static final long serialVersionUID = 1L;

    @Column(name = "username")
    private String username;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "password")
    @DiffIgnore
    private String password;

    @Column(name = "is_active") // indicates if the citizen user has "removed" their account
    private boolean isActive;

    @Column(name = "is_approved") // available only for supplier users to indicate if the supplier user has been approved by the municipality admin
    private boolean isApproved;

    @Column(name = "tenant_id")
    @DiffIgnore
    private UUID tenantId;

    @OneToOne()
    @JoinTable(schema = "l4l_security", name = "user_role",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    @DiffIgnore
    private Role role;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    @JoinColumn(name = "id")
    private UserProfile userProfile;

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(name = "is_enabled") // indicates if the user has verified their email address and can log in
    private Boolean isEnabled;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @DiffIgnore
    private RefreshToken refreshToken;

    public void setRefreshToken(RefreshToken refreshToken) {
        this.refreshToken = refreshToken;
        if (refreshToken != null && refreshToken.getUser() != this) {
            refreshToken.setUser(this);
        }
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(this.role);
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public static User createUserToEntity(CreateUserDto createUserDto, UUID tenantId, String token) {
        return User.builder()
                .firstName(createUserDto.firstName())
                .lastName(createUserDto.lastName())
                .username(createUserDto.email())
                .isApproved(true)
                .isActive(true)
                .isEnabled(false)
                .password(token)
                .tenantId(tenantId)
                .build();
    }
}