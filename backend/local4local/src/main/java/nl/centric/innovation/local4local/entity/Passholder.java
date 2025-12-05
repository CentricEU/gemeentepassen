package nl.centric.innovation.local4local.entity;

import java.time.LocalDate;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.NamedAttributeNode;
import javax.persistence.NamedEntityGraph;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(schema = "l4l_global", name = "passholders")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@NamedEntityGraph(
        name = "include-grant-graph",
        attributeNodes = {
                @NamedAttributeNode("grants")
        }
)
public class Passholder extends BaseEntity {

	@Column(name = "name")
	public String name;

	@Column(name = "bsn", unique = true)
	public String bsn;

	@Column(name = "address")
	public String address;

	@Column(name = "pass_number", unique = true)
	public String passNumber;

	@Column(name = "residence_city")
	public String residenceCity;

	@Column(name = "expiring_date")
	public LocalDate expiringDate;

	@ManyToOne
	@JoinColumn(name = "tenant_id")
	private Tenant tenant;

	@ManyToMany(fetch = FetchType.LAZY)
	@JoinTable(name = "passholders_grants", schema = "l4l_global", joinColumns = @JoinColumn(name = "passholder_id"), inverseJoinColumns = @JoinColumn(name = "grant_id"))
	private List<Grant> grants;

	@OneToOne
	@JoinColumn(name = "user_id", referencedColumnName = "id")
	private User user;
}