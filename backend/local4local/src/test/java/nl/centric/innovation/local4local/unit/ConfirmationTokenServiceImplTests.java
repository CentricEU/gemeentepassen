package nl.centric.innovation.local4local.unit;
import nl.centric.innovation.local4local.entity.ConfirmationToken;
import nl.centric.innovation.local4local.repository.ConfirmationTokenRepository;
import nl.centric.innovation.local4local.service.impl.ConfirmationTokenServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
@ExtendWith(MockitoExtension.class)
public class ConfirmationTokenServiceImplTests {

    @Mock
    private ConfirmationTokenRepository confirmationTokenRepository;

    @InjectMocks
    private ConfirmationTokenServiceImpl confirmationTokenService;

    @Test
    void testSave() {
        // Given
        ConfirmationToken tokenToSave = new ConfirmationToken(/* provide necessary parameters */);
        ConfirmationToken savedToken = new ConfirmationToken(/* provide necessary parameters */);

        // Mock the behavior of confirmationTokenRepository.save to return the saved token
        when(confirmationTokenRepository.save(tokenToSave)).thenReturn(savedToken);

        // When
        ConfirmationToken result = confirmationTokenService.save(tokenToSave);

        // Then
        assertEquals(savedToken, result);
        verify(confirmationTokenRepository).save(tokenToSave);
    }
}
