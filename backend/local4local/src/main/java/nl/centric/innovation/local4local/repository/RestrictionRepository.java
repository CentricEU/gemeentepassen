package nl.centric.innovation.local4local.repository;

import nl.centric.innovation.local4local.entity.Restriction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RestrictionRepository extends JpaRepository<Restriction, UUID> {

}
