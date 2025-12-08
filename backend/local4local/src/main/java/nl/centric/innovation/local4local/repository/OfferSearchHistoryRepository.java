package nl.centric.innovation.local4local.repository;

import nl.centric.innovation.local4local.entity.OfferSearchHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OfferSearchHistoryRepository extends JpaRepository<OfferSearchHistory, UUID> {

    String FIND_TOP_5_SEARCH_KEYWORDS =
            "SELECT o.search_keyword FROM l4l_global.offer_search_history o WHERE o.user_id = :userId ORDER BY o.created_date DESC LIMIT 5";

    Optional<OfferSearchHistory> findBySearchKeywordAndUserId(String searchKeyword, UUID userId);

    @Query(value = FIND_TOP_5_SEARCH_KEYWORDS, nativeQuery = true)
    List<String> findTop5SearchKeywordsByUserIdOrderByCreatedDateDesc(@Param("userId") UUID userId);
}
