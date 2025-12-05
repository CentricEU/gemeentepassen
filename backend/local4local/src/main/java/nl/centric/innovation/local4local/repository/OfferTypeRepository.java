package nl.centric.innovation.local4local.repository;

import nl.centric.innovation.local4local.entity.OfferType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OfferTypeRepository extends JpaRepository<OfferType, Integer> {


}
