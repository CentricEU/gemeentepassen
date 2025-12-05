package nl.centric.innovation.local4local.unit;

import nl.centric.innovation.local4local.entity.OfferType;
import nl.centric.innovation.local4local.repository.OfferTypeRepository;
import nl.centric.innovation.local4local.service.impl.OfferTypeServiceImpl;
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
public class OfferTyperServiceImplTests {

    @InjectMocks
    private OfferTypeServiceImpl offerTypeService;

    @Mock
    private OfferTypeRepository offerTypeRepository;

    @Test
    public void GivenCallToGetOfferType_WhenCallIsMade_AllOfferTypesShouldBePresent() {
        // Mock data
        OfferType offerType1 = OfferType.builder()
                .offerTypeId(1)
                .offerTypeLabel("percentange")
                .build();

        OfferType offerType2 = OfferType.builder()
                .offerTypeId(2)
                .offerTypeLabel("bogo")
                .build();

        List<OfferType> mockOfferTypes = Arrays.asList(offerType1, offerType2);

        // Mock the behavior of the offerTypeRepository
        when(offerTypeRepository.findAll()).thenReturn(mockOfferTypes);

        // Call the method to be tested
        List<OfferType> result = offerTypeService.getAllOfferTypes();

        // Verify the result
        assertEquals(mockOfferTypes, result);
    }


}
