package nl.centric.innovation.local4local.repository;

import nl.centric.innovation.local4local.entity.Pass;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface PassRepository extends JpaRepository<Pass, UUID> {
}

