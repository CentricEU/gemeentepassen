package nl.centric.innovation.local4local.repository;

import nl.centric.innovation.local4local.entity.Supplier;
import nl.centric.innovation.local4local.enums.StatusUpdateEnum;
import nl.centric.innovation.local4local.enums.SupplierStatusEnum;

import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RestResource;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@JaversSpringDataAuditable
public interface SupplierRepository extends JpaRepository<Supplier, UUID> {
    String UPDATE_STATUS_UPDATE = "UPDATE l4l_security.suppliers SET status_update = CAST(:value AS l4l_security.status_update_enum) where id= :supplierId ";

    String CLEAR_STATUS_UPDATE = "UPDATE Supplier s SET s.statusUpdate = null where s.id= :supplierId ";

    @EntityGraph("Supplier.withWorkingHours")
    @Query("SELECT s FROM Supplier s WHERE s.id = :id")
    Optional<Supplier> findByIdWithWorkingHours(@Param("id") UUID id);

    @EntityGraph("include-supplier-profile-graph-with-category")
    Page<Supplier> findAllByTenantIdAndStatusInOrderByCreatedDateDesc(UUID tenantId, Pageable pageable, Set<SupplierStatusEnum> statuses);

    @EntityGraph("include-supplier-profile-graph-with-category")
    Page<Supplier> findAllByTenantIdAndStatus(UUID tenantId, Pageable pageable, SupplierStatusEnum status);

    @RestResource(path="list")
    @EntityGraph("include-supplier-profile-graph-with-category")
    List<Supplier> findAllByTenantIdAndStatus(UUID tenantId, SupplierStatusEnum status);

    Integer countByTenantIdAndStatusIn(UUID tenantId, Set<SupplierStatusEnum> statuses);

    @Modifying
    @Query(value = UPDATE_STATUS_UPDATE, nativeQuery = true)
    void updateSupplierHasStatusUpdate(@Param("supplierId") UUID supplierId,  @Param("value") StatusUpdateEnum value);

    @Modifying
    @Query(CLEAR_STATUS_UPDATE)
    void clearSupplierStatusUpdate(UUID supplierId);

    @EntityGraph("include-supplier-profile-graph-with-category")
    Optional<Supplier> findWithSupplierProfileById(UUID id);

    boolean existsByKvk(String kvk);

    boolean existsByKvkAndIdNot(String kvk, UUID id);
}
