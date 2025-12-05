package nl.centric.innovation.local4local.repository;

import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.enums.SupplierStatusEnum;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface SupplierRepository extends JpaRepository<Supplier, UUID> {

    final String UPDATE_SUPPLIER = "UPDATE Supplier s SET s.isProfileSet=true, s.status= :status where s.id= :supplierId ";
    final String UPDATE_HAS_STATUS_UPDATE = "UPDATE Supplier s SET s.hasStatusUpdate = :value where s.id= :supplierId ";
    final String UPDATE_SUPPLIER_PROFILE = "UPDATE l4l_security.suppliers SET profile_id = :value where id= :supplierId ";

    @EntityGraph("include-supplier-profile-graph-with-category")
    Page<Supplier> findAllByTenantIdAndStatusIn(UUID tenantId, Pageable pageable, Set<SupplierStatusEnum> statuses);

    @EntityGraph("include-supplier-profile-graph-with-category")
    Page<Supplier> findAllByTenantIdAndStatus(UUID tenantId, Pageable pageable, SupplierStatusEnum status);

    @EntityGraph("include-supplier-profile-graph-with-category")
    List<Supplier> findAllByTenantIdAndStatus(UUID tenantId, SupplierStatusEnum status);

    Integer countByTenantIdAndStatusIn(UUID tenantId, Set<SupplierStatusEnum> statuses);

    @Modifying
    @Query(UPDATE_SUPPLIER)
    void updateSupplierByIsProfileSet(SupplierStatusEnum status, UUID supplierId);

    @Modifying
    @Query(UPDATE_HAS_STATUS_UPDATE)
    void updateSupplierHasStatusUpdate(UUID supplierId, boolean value);

    @Modifying
    @Query(nativeQuery = true, value = UPDATE_SUPPLIER_PROFILE)
    void updateSupplierProfile(UUID supplierId, UUID value);

    @EntityGraph("include-supplier-profile-graph-with-category")
    Optional<Supplier> findWithSupplierProfileById(UUID id);

}
