package nl.centric.innovation.local4local.unit;


import lombok.SneakyThrows;
import nl.centric.innovation.local4local.dto.RestrictionRequestDto;
import nl.centric.innovation.local4local.entity.Restriction;
import nl.centric.innovation.local4local.repository.RestrictionRepository;
import nl.centric.innovation.local4local.service.impl.RestrictionServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertNotNull;
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
        RestrictionRequestDto restrictionRequestDto = restrictionRequestDtoBuilder(null,null);
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

    private RestrictionRequestDto restrictionRequestDtoBuilder(LocalDateTime timeFrom, LocalDateTime timeTo) {
        return RestrictionRequestDto.builder()
                .timeTo(timeTo)
                .timeFrom(timeFrom)
                .build();
    }
}
