package nl.centric.innovation.local4local.unit;

import lombok.SneakyThrows;
import nl.centric.innovation.local4local.entity.OfferSearchHistory;
import nl.centric.innovation.local4local.entity.User;
import nl.centric.innovation.local4local.repository.OfferSearchHistoryRepository;
import nl.centric.innovation.local4local.service.impl.OfferSearchHistoryService;
import nl.centric.innovation.local4local.service.impl.PrincipalService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OfferSearchHistoryServiceTests {
    @InjectMocks
    private OfferSearchHistoryService offerSearchHistoryService;
    @Mock
    private OfferSearchHistoryRepository offerSearchHistoryRepository;
    @Mock
    private PrincipalService principalService;

    @Test
    @SneakyThrows
    void GivenNewSearchKeyword_WhenSaveSearchHistory_ThenSaveNewHistory() {
        // Given
        String searchKeyword = "newKeyword";
        User user = new User();
        user.setId(UUID.randomUUID());
        when(offerSearchHistoryRepository.findBySearchKeywordAndUserId(searchKeyword, user.getId())).thenReturn(Optional.empty());
        when(principalService.getUser()).thenReturn(user);

        // When
        offerSearchHistoryService.saveSearchHistory(searchKeyword);

        // Then
        verify(offerSearchHistoryRepository).save(any(OfferSearchHistory.class));
    }

    @Test
    @SneakyThrows
    void GivenExistingSearchKeyword_WhenSaveSearchHistory_ThenUpdateExistingHistory() {
        // Given
        String searchKeyword = "existingKeyword";
        OfferSearchHistory existingHistory = new OfferSearchHistory();
        User user = new User();
        user.setId(UUID.randomUUID());

        when(principalService.getUser()).thenReturn(user);
        when(offerSearchHistoryRepository.findBySearchKeywordAndUserId(searchKeyword, user.getId())).thenReturn(Optional.of(existingHistory));

        // When
        offerSearchHistoryService.saveSearchHistory(searchKeyword);

        // Then
        verify(offerSearchHistoryRepository).save(existingHistory);
        assertNotNull(existingHistory.getCreatedDate());
    }

    @Test
    void GivenValidUser_WhenGetSearchHistoryForCitizen_ThenReturnTop5SearchKeywords() {
        // Given
        User user = new User();
        user.setId(UUID.randomUUID());
        when(principalService.getUser()).thenReturn(user);
        List<String> expectedKeywords = List.of("keyword1", "keyword2", "keyword3", "keyword4", "keyword5");
        when(offerSearchHistoryRepository.findTop5SearchKeywordsByUserIdOrderByCreatedDateDesc(user.getId())).thenReturn(expectedKeywords);

        // When
        List<String> result = offerSearchHistoryService.getSearchHistoryForCitizen();

        // Then
        assertEquals(expectedKeywords, result);
    }

    @Test
    void GivenNoSearchHistory_WhenGetSearchHistoryForCitizen_ThenReturnEmptyList() {
        // Given
        User user = new User();
        user.setId(UUID.randomUUID());
        when(principalService.getUser()).thenReturn(user);
        when(offerSearchHistoryRepository.findTop5SearchKeywordsByUserIdOrderByCreatedDateDesc(user.getId())).thenReturn(Collections.emptyList());

        // When
        List<String> result = offerSearchHistoryService.getSearchHistoryForCitizen();

        // Then
        assertTrue(result.isEmpty());
    }
}
