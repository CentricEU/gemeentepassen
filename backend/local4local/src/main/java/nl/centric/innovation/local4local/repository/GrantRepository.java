package nl.centric.innovation.local4local.repository;

import nl.centric.innovation.local4local.entity.Grant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface GrantRepository extends JpaRepository<Grant, UUID> {
    
    Page<Grant> findAllByTenantId(UUID tenantId, Pageable pageable);

    List<Grant> findAllByTenantId(UUID tenantId);

    List<Grant> findAllByTenantIdAndExpirationDateAfter(UUID tenantId, LocalDate currentDate);

    Integer countByTenantId(UUID tenantId);

    Set<Grant> findByIdIn(@Param("ids") Set<UUID> ids);



}
