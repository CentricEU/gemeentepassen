package nl.centric.innovation.local4local.repository;

import nl.centric.innovation.local4local.entity.RejectSupplier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RejectSupplierRepository extends JpaRepository<RejectSupplier, UUID> {
    Optional<RejectSupplier> findBySupplierId(UUID supplierId);
}
