package nl.centric.innovation.local4local.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.locationtech.jts.geom.Geometry;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(schema = "l4l_security", name = "supplier_profile")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupplierProfile extends BaseEntity {

    @Column(name = "logo")
    private String logo;

    @Column(name = "owner_name")
    private String ownerName;

    @Column(name = "company_address")
    private String companyBranchAddress;

    @Column(name = "district")
    private String branchProvince;

    @Column(name = "zip_code")
    private String branchZip;

    @Column(name = "location")
    private String branchLocation;

    @Column(name = "telephone")
    private String branchTelephone;

    @Column(name = "email")
    private String email;

    @Column(name = "website")
    private String website;

    @Column(name = "account_manager")
    private String accountManager;

    @Column(name = "coordinates_string")
    private String coordinatesString;

    @Column(name = "coordinates", columnDefinition = "Geometry")
    private Geometry coordinates;

    @ManyToOne
    @JoinColumn(name = "legal_form_id", nullable = false)
    private LegalForm legalForm;

    @ManyToOne
    @JoinColumn(name = "group_name_id", nullable = false)
    private Group groupName;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne
    @JoinColumn(name = "subcategory_id")
    private Subcategory subcategory;

}
