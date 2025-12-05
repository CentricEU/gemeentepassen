package nl.centric.innovation.local4local.repository;

import nl.centric.innovation.local4local.entity.Offer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Repository
public interface OfferRepositoryCustom extends JpaRepository<Offer, UUID> {
    @Modifying
    @Transactional
    @Query(nativeQuery = true, value = "CALL l4l_global.update_offer_status()")
    void updateOfferStatus();
}