package nl.centric.innovation.local4local.entity;

import java.time.LocalDate;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import nl.centric.innovation.local4local.dto.PassholderViewDto;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(schema = "l4l_global", name = "passholders")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
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

	@OneToOne
	@JoinColumn(name = "user_id", referencedColumnName = "id")
	private User user;

    @ManyToOne
    @JoinColumn(name = "citizen_group_id")
    private CitizenGroup citizenGroup;

	public static Passholder passholderViewDtoToEntity(PassholderViewDto passholder, Tenant tenant) {
		return Passholder.builder()
				.address(passholder.address())
				.bsn(passholder.bsn())
				.expiringDate(passholder.expiringDate())
				.residenceCity(passholder.residenceCity())
				.name(passholder.name())
				.passNumber(passholder.passNumber())
				.tenant(tenant)
				.build();
	}
}