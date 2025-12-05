package nl.centric.innovation.local4local.repository;

import nl.centric.innovation.local4local.entity.RejectOffer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RejectOfferRepository extends JpaRepository<RejectOffer, UUID> {

    Optional<RejectOffer> findByOfferId(UUID offerId);
}
