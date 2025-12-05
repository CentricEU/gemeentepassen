package nl.centric.innovation.local4local.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import nl.centric.innovation.local4local.entity.Passholder;

public interface PassholderRepository extends JpaRepository<Passholder, UUID> {
    @EntityGraph(value = "include-grant-graph", type = EntityGraph.EntityGraphType.LOAD)
	Page<Passholder> findAllByTenantId(UUID tenantId, Pageable pageable);

	Integer countByTenantId(UUID tenantId);

	Optional<Passholder> findByPassNumber(String passNumber);
}
