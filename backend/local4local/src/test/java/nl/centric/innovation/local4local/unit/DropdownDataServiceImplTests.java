package nl.centric.innovation.local4local.unit;

import nl.centric.innovation.local4local.dto.DropdownDataFilterDto;
import nl.centric.innovation.local4local.dto.EnumValueDto;
import nl.centric.innovation.local4local.entity.OfferType;
import nl.centric.innovation.local4local.enums.GenericStatusEnum;
import nl.centric.innovation.local4local.repository.OfferTypeRepository;
import nl.centric.innovation.local4local.service.impl.DropdownDataService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DropdownDataServiceImplTests {

    @InjectMocks
    private DropdownDataService dropdownDataService;

    @Mock
    private OfferTypeRepository offerTypeRepository;

    @Test
    void GivenValidRequest_WhenGetAllDropdownsData_ThenReturnDropdownDataFilterDto() {
        // Given
        List<OfferType> mockOfferTypes = List.of(
                new OfferType(1, "Type1"),
                new OfferType(2, "Type2")
        );

        when(offerTypeRepository.findAll()).thenReturn(mockOfferTypes);

        List<EnumValueDto> expectedStatusDto = Arrays.stream(GenericStatusEnum.values())
                .map(status -> new EnumValueDto(status.name(), status.getKey()))
                .toList();

        // When
        DropdownDataFilterDto result = dropdownDataService.getAllDropdownsData();

        // Then
        assertEquals(expectedStatusDto, result.statuses());
        assertEquals(mockOfferTypes, result.offerTypes());
    }

}
