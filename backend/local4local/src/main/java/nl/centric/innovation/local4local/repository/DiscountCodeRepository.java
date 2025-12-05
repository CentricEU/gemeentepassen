package nl.centric.innovation.local4local.repository;

import nl.centric.innovation.local4local.entity.DiscountCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DiscountCodeRepository extends JpaRepository<DiscountCode, UUID> {

    String FIND_ALL_DISCOUNT_CODES_BY_USER_ID_ORDERED_BY_EXPIRATION_AND_STATUS =
            """
                            SELECT dc FROM DiscountCode dc JOIN dc.offer o WHERE dc.userId = :userId 
                            ORDER BY CASE WHEN dc.isActive = true AND o.status != 'EXPIRED' 
                            THEN 0 ELSE 1 END, o.expirationDate ASC
                    """;

    Optional<DiscountCode> findByUserIdAndOfferId(UUID userId, UUID offerId);

    Optional<DiscountCode> findByCodeIgnoreCaseAndIsActiveTrueAndOfferSupplierId(String code, UUID supplierId);

    @Query(FIND_ALL_DISCOUNT_CODES_BY_USER_ID_ORDERED_BY_EXPIRATION_AND_STATUS)
    List<DiscountCode> findByUserIdOrderByOfferExpirationDateAndIsActive(UUID userId);

}
