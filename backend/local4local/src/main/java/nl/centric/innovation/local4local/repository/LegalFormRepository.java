package nl.centric.innovation.local4local.repository;

import nl.centric.innovation.local4local.entity.LegalForm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LegalFormRepository extends JpaRepository<LegalForm, Integer> {
}
