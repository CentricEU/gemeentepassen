package nl.centric.innovation.local4local.unit;


import lombok.SneakyThrows;
import nl.centric.innovation.local4local.dto.RestrictionRequestDto;
import nl.centric.innovation.local4local.entity.Restriction;
import nl.centric.innovation.local4local.exceptions.DtoValidateException;
import nl.centric.innovation.local4local.repository.RestrictionRepository;
import nl.centric.innovation.local4local.service.impl.RestrictionServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class RestrictionServiceImplTests {

    @Mock
    private RestrictionRepository restrictionRepository;

    @InjectMocks
    private RestrictionServiceImpl restrictionService;

    @Test
    @SneakyThrows
    public void GivenValidRequest_WhenSaveRestriction_ThenExpectSuccess() {
        RestrictionRequestDto restrictionRequestDto = restrictionRequestDtoBuilder(10,15,null,null);
        when(restrictionRepository.save(any(Restriction.class))).thenAnswer(invocation -> {
            Restriction restriction = invocation.getArgument(0);
            if (restriction.getId() == null) {
                restriction.setId(UUID.randomUUID());
            }
            return restriction;
        });

        Restriction result = restrictionService.saveRestriction(restrictionRequestDto);

        verify(restrictionRepository).save(any(Restriction.class));
        assertNotNull(result);

    }
    @Test
    public void GivenInvalidPrices_WhenSaveRestriction_ThenExpectDtoValidateException() {
        RestrictionRequestDto restrictionRequestDto = restrictionRequestDtoBuilder(10,10,null,null);

        assertThrows(DtoValidateException.class, () -> restrictionService.saveRestriction(restrictionRequestDto));
    }

    @Test
    public void GivenInvalidTimes_WhenSaveRestriction_ThenExpectDtoValidateException() {
        RestrictionRequestDto restrictionRequestDto = restrictionRequestDtoBuilder(null,null,
               LocalDateTime.of(LocalDate.of(2024,8,1), LocalTime.of(10,20)),
               LocalDateTime.of(LocalDate.of(2024,8,1), LocalTime.of(9,20)));

        assertThrows(DtoValidateException.class, () -> restrictionService.saveRestriction(restrictionRequestDto));
    }

    private RestrictionRequestDto restrictionRequestDtoBuilder(Integer minPrice, Integer maxPrice,
                                                               LocalDateTime timeFrom, LocalDateTime timeTo) {
        return RestrictionRequestDto.builder()
                .ageRestriction(10)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .timeTo(timeTo)
                .timeFrom(timeFrom)
                .build();
    }
}
