package nl.centric.innovation.local4local.entity;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.NamedAttributeNode;
import javax.persistence.NamedEntityGraph;
import javax.persistence.NamedSubgraph;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;

import io.hypersistence.utils.hibernate.type.basic.PostgreSQLEnumType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import nl.centric.innovation.local4local.enums.SupplierStatusEnum;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(schema = "l4l_security", name = "suppliers")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@TypeDef(name = "pgsql_enum", typeClass = PostgreSQLEnumType.class)

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
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    @Column(name = "is_profile_set")
    private Boolean isProfileSet;

    @Column(name = "is_reviewed")
    private Boolean isReviewed;

    @Column(name = "has_status_update")
    private boolean hasStatusUpdate;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "status")
    @Type(type = "pgsql_enum")
    private SupplierStatusEnum status;

    @Column(name = "admin_email")
    private String adminEmail;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id")
    private SupplierProfile profile;

    @OneToMany(cascade = {CascadeType.ALL}, fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", insertable = false, updatable = false)
    private List<WorkingHours> workingHours;

}
