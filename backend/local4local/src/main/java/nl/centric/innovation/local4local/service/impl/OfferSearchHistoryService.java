package nl.centric.innovation.local4local.service.impl;

import lombok.RequiredArgsConstructor;
import nl.centric.innovation.local4local.entity.OfferSearchHistory;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.repository.OfferSearchHistoryRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import static nl.centric.innovation.local4local.entity.OfferSearchHistory.createEntityOfferSearchHistory;

@Service
@RequiredArgsConstructor
public class OfferSearchHistoryService {

    private final OfferSearchHistoryRepository offerSearchHistoryRepository;

    private final PrincipalService principalService;


    public void saveSearchHistory(String searchKeyword) {

        Optional<OfferSearchHistory> offerSearchHistory = offerSearchHistoryRepository.findBySearchKeywordAndUserId(searchKeyword, getUser().getId());
        if (offerSearchHistory.isPresent()) {
            offerSearchHistory.get().setCreatedDate(LocalDateTime.now());
            offerSearchHistoryRepository.save(offerSearchHistory.get());
            return;
        }

        offerSearchHistoryRepository.save(createEntityOfferSearchHistory(getUser(),searchKeyword));
    }

    public List<String> getSearchHistoryForCitizen() {
        return offerSearchHistoryRepository.findTop5SearchKeywordsByUserIdOrderByCreatedDateDesc(getUser().getId());
    }

    private User getUser() {
        return principalService.getUser();
    }
}
