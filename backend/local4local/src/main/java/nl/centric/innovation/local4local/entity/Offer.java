package nl.centric.innovation.local4local.entity;

import java.time.LocalDate;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.NamedAttributeNode;
import javax.persistence.NamedEntityGraph;
import javax.persistence.NamedSubgraph;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import nl.centric.innovation.local4local.dto.OfferRequestDto;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;
import org.locationtech.jts.geom.Geometry;

import io.hypersistence.utils.hibernate.type.basic.PostgreSQLEnumType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import nl.centric.innovation.local4local.enums.GenericStatusEnum;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(schema = "l4l_global", name = "offers")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@TypeDef(name = "pgsql_enum", typeClass = PostgreSQLEnumType.class)
@NamedEntityGraph(
        name = "include-grants-supplier-graph",
        attributeNodes = {
                @NamedAttributeNode("grants"),
                @NamedAttributeNode("supplier")

        }
)
@NamedEntityGraph(
        name = "include-restriction-graph",
        attributeNodes = {
                @NamedAttributeNode("restriction")
        }
)
@NamedEntityGraph(
        name = "include-grants-supplier-restriction-profile-graph",
        attributeNodes = {
                @NamedAttributeNode(value = "supplier", subgraph = "profile"),
                @NamedAttributeNode("grants"),
                @NamedAttributeNode("restriction")
        },
        subgraphs = {
                @NamedSubgraph(name = "profile",
                        attributeNodes = @NamedAttributeNode(value = "profile"))

        }
)
public class Offer extends BaseEntity {

    @Column(name = "title")
    private String title;

    @ManyToOne
    @JoinColumn(name = "offer_type_id")
    private OfferType offerType;

    @Column(name = "description")
    private String description;

    @Column(name = "amount")
    private Double amount;

    @Column(columnDefinition = "offer_for")
    private String citizenOfferType;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "expiration_date")
    private LocalDate expirationDate;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(schema = "l4l_global", name = "offer_grants", joinColumns = @JoinColumn(name = "offer_id"), inverseJoinColumns = @JoinColumn(name = "grant_id"))
    private Set<Grant> grants;
    
    @ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "supplier_id")
	private Supplier supplier;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "status")
    @Type(type = "pgsql_enum")
    private GenericStatusEnum status;

    @Column(name = "coordinates_string")
    private String coordinatesString;

    @Column(name = "coordinates", columnDefinition = "Geometry")
    private Geometry coordinates;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "restriction_id")
    private Restriction restriction;

    @Column(name = "is_active")
    private boolean isActive;

    public static Offer offerRequestDtoToEntity(OfferRequestDto offerRequestDto, OfferType offerType, Supplier supplier,
                                                Set<Grant> grants) {
        return Offer.builder()
                .title(offerRequestDto.title())
                .citizenOfferType("CITIZEN_WITH_PASS")
                .offerType(offerType)
                .description(offerRequestDto.description())
                .amount(offerRequestDto.amount())
                .startDate(offerRequestDto.startDate())
                .expirationDate(offerRequestDto.expirationDate())
                .status(GenericStatusEnum.PENDING)
                .supplier(supplier)
                .grants(grants)
                .coordinates(supplier.getProfile().getCoordinates())
                .coordinatesString(supplier.getProfile().getCoordinatesString())
                .isActive(true)
                .build();
    }
}
