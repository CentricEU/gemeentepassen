package nl.centric.innovation.local4local.repository;

import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.enums.SupplierStatusEnum;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface SupplierRepository extends JpaRepository<Supplier, UUID> {
    final String UPDATE_HAS_STATUS_UPDATE = "UPDATE Supplier s SET s.hasStatusUpdate = :value where s.id= :supplierId ";

    final String UPDATE_PROFILE_AND_STATUS = """
                UPDATE l4l_security.suppliers 
                SET profile_id = :profileId, 
                    status = CAST(:status AS l4l_global.supplier_status),
                    is_profile_set = true 
                WHERE id = :supplierId
            """;

    @EntityGraph("include-supplier-profile-graph-with-category")
    Page<Supplier> findAllByTenantIdAndStatusIn(UUID tenantId, Pageable pageable, Set<SupplierStatusEnum> statuses);

    @EntityGraph("include-supplier-profile-graph-with-category")
    Page<Supplier> findAllByTenantIdAndStatus(UUID tenantId, Pageable pageable, SupplierStatusEnum status);

    @EntityGraph("include-supplier-profile-graph-with-category")
    List<Supplier> findAllByTenantIdAndStatus(UUID tenantId, SupplierStatusEnum status);

    Integer countByTenantIdAndStatusIn(UUID tenantId, Set<SupplierStatusEnum> statuses);

    @Modifying
    @Query(UPDATE_HAS_STATUS_UPDATE)
    void updateSupplierHasStatusUpdate(UUID supplierId, boolean value);

    @EntityGraph("include-supplier-profile-graph-with-category")
    Optional<Supplier> findWithSupplierProfileById(UUID id);

    @Modifying
    @Query(value = UPDATE_PROFILE_AND_STATUS, nativeQuery = true)
    void updateProfileAndStatus(@Param("supplierId") UUID supplierId,
                                @Param("profileId") UUID profileId,
                                @Param("status") String status);

}
