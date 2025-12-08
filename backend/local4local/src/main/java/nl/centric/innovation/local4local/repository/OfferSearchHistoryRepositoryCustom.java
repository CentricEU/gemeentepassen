

package nl.centric.innovation.local4local.repository;

import nl.centric.innovation.local4local.entity.OfferSearchHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

public interface OfferSearchHistoryRepositoryCustom extends JpaRepository<OfferSearchHistory, UUID> {

    @Modifying
    @Transactional
    @Query(nativeQuery = true, value = "CALL l4l_global.cleanup_offer_search_history()")
    void cleanupOfferSearchHistory();
}