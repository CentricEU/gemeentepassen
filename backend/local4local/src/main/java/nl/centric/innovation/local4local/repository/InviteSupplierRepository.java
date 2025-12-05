package nl.centric.innovation.local4local.repository;

import nl.centric.innovation.local4local.entity.InviteSupplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.CrudRepository;

import java.util.UUID;

public interface InviteSupplierRepository extends CrudRepository<InviteSupplier, UUID> {

    Page<InviteSupplier> findAllByTenantIdAndIsActiveTrueOrderByCreatedDateDesc(UUID tenantId, Pageable pageable);

    Integer countByTenantIdAndIsActiveTrue(UUID tenantId);
}
