package nl.centric.innovation.local4local.repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import nl.centric.innovation.local4local.entity.CitizenGroup;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import nl.centric.innovation.local4local.entity.Passholder;

public interface PassholderRepository extends JpaRepository<Passholder, UUID> {
	Page<Passholder> findAllByTenantIdOrderByCreatedDateDesc(UUID tenantId, Pageable pageable);

	Integer countByTenantId(UUID tenantId);

    Integer countByCitizenGroupId(UUID citizenGroupId);

	Optional<Passholder> findByPassNumber(String passNumber);

    Optional<Passholder> findByUserId(UUID userId);

    List<Passholder> findAllByUserNotNullAndCitizenGroupIn(Set<CitizenGroup> citizenGroups);

}
