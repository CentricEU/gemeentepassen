package nl.centric.innovation.local4local.repository;

import nl.centric.innovation.local4local.entity.CitizenGroupAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface GroupCitizenAssignmentRepository extends JpaRepository<CitizenGroupAssignment, UUID> {
    Optional<CitizenGroupAssignment> findByCitizenId(UUID uuid);
}
