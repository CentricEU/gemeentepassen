package nl.centric.innovation.local4local.repository;

import nl.centric.innovation.local4local.entity.CitizenGroup;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RestResource;

import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface CitizenGroupRepository extends JpaRepository<CitizenGroup, UUID> {
    Page<CitizenGroup> findAllByTenantId(UUID tenantId, Pageable pageable);

    List<CitizenGroup> findAllByTenantIdAndBenefitsIsNotEmpty(UUID tenantId);

    @RestResource(path = "list")
    List<CitizenGroup> findAllByTenantId(UUID tenantId);

    Integer countAllByTenantId(UUID tenantId);

    Set<CitizenGroup> findByIdInAndTenantId(@Param("ids") Set<UUID> ids,
                                            @Param("tenantId") UUID tenantId);
}

