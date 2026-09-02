package nl.centric.innovation.local4local.entity;


import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.NamedAttributeNode;
import jakarta.persistence.NamedEntityGraph;
import jakarta.persistence.NamedSubgraph;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import nl.centric.innovation.local4local.enums.StatusUpdateEnum;
import org.hibernate.annotations.JdbcType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import nl.centric.innovation.local4local.enums.SupplierStatusEnum;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;
import org.javers.core.metamodel.annotation.DiffIgnore;
import java.util.List;

/**
 * @DiffIgnore is used to ignore the tenant field when comparing Supplier entities with JaVers, since
 * is not relevant for most comparisons of Supplier entities.
 * Also, the profile field is ignored in the default entity graph to prevent performance issues (lazy loading).
 */

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(schema = "l4l_security", name = "suppliers")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor

@NamedEntityGraph(
        name = "Supplier.withWorkingHours",
        attributeNodes = @NamedAttributeNode("workingHours")
)
@NamedEntityGraph(
        name = "include-supplier-profile-graph",
        attributeNodes = {
                @NamedAttributeNode("profile")
        }
)

@NamedEntityGraph(
        name = "include-supplier-profile-graph-with-category",
        attributeNodes = @NamedAttributeNode(value = "profile", subgraph = "profile.category"),
        subgraphs = {
                @NamedSubgraph(name = "profile.category",
                        attributeNodes = @NamedAttributeNode(value = "category"))
        })

@NamedEntityGraph(
        name = "include-working-hours-graph",
        attributeNodes = {
                @NamedAttributeNode("workingHours")
        }
)
public class Supplier extends BaseEntity {

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "kvk")
    private String kvk;

    @ManyToOne
    @ToString.Exclude
    @DiffIgnore
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    @Column(name = "is_profile_set")
    private Boolean isProfileSet;

    @Column(name = "is_reviewed")
    private Boolean isReviewed;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name = "status_update", columnDefinition = "status_update_enum")
    private StatusUpdateEnum statusUpdate;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name = "status", columnDefinition = "supplier_status")
    private SupplierStatusEnum status;

    @Column(name = "admin_email")
    private String adminEmail;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id")
    @DiffIgnore
    private SupplierProfile profile;

    @OneToMany(cascade = {CascadeType.ALL}, fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", insertable = false, updatable = false)
    private List<WorkingHours> workingHours;

}
