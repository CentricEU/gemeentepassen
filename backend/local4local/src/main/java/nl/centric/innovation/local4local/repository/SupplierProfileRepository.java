package nl.centric.innovation.local4local.repository;

import nl.centric.innovation.local4local.entity.SupplierProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SupplierProfileRepository extends JpaRepository<SupplierProfile, UUID> {

}
