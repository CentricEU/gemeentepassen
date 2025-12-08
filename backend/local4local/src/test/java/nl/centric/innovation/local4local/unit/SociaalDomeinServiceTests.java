package nl.centric.innovation.local4local.unit;

import nl.centric.innovation.local4local.dto.SociaalDomeinResponse;
import nl.centric.innovation.local4local.dto.SociaalDomeinToken;
import nl.centric.innovation.local4local.exceptions.SocialDomeinException;
import nl.centric.innovation.local4local.service.impl.SociaalDomeinService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.lang.reflect.Field;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

public class SociaalDomeinServiceTests {

    private SociaalDomeinService service;
    private RestTemplate restTemplate;

    @BeforeEach
    void setUp() throws Exception {
        restTemplate = mock(RestTemplate.class);
        service = new SociaalDomeinService(restTemplate);

        setPrivateField(service, "authenticationUrl", "http://fake-auth.com");
        setPrivateField(service, "clientId", "client-id");
        setPrivateField(service, "clientSecret", "client-secret");
        setPrivateField(service, "socialDomeinError", "SocialDomein error occurred");
    }

    private void setPrivateField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }

    @Test
    void testGetToken_ReturnsCachedToken() throws Exception {
        // Given
        SociaalDomeinToken cachedToken = new SociaalDomeinToken("abc123", LocalDateTime.now().plusMinutes(5));
        setPrivateField(service, "token", cachedToken);

        // When
        String token = service.getToken();

        // Assert
        Assertions.assertEquals("abc123", token);
        verifyNoInteractions(restTemplate);
    }

    @Test
    void testGetToken_FetchesNewToken() throws Exception {
        // Given
        SociaalDomeinResponse response = new SociaalDomeinResponse("new-token", 3600);
        when(restTemplate.postForEntity(
                anyString(),
                ArgumentMatchers.<Object>any(),
                eq(SociaalDomeinResponse.class)
        )).thenReturn(new ResponseEntity<>(response, HttpStatus.OK));

        // When
        String token = service.getToken();

        // Assert
        Assertions.assertEquals("new-token", token);

        // Access private field safely
        Field tokenField = SociaalDomeinService.class.getDeclaredField("token");
        tokenField.setAccessible(true);
        SociaalDomeinToken fetchedToken = (SociaalDomeinToken) tokenField.get(service);

        Assertions.assertNotNull(fetchedToken);
        Assertions.assertTrue(fetchedToken.isValid());
    }

    @Test
    void testGetToken_HandlesHttpClientErrorException() {
        // Given
        when(restTemplate.postForEntity(
                anyString(),
                ArgumentMatchers.<Object>any(),
                eq(SociaalDomeinResponse.class)
        )).thenThrow(HttpClientErrorException.create(HttpStatus.BAD_REQUEST, "Bad Request", null, null, null));

        // When / Assert
        SocialDomeinException ex = assertThrows(SocialDomeinException.class, () -> service.getToken());
        Assertions.assertEquals("SocialDomein error occurred", ex.getMessage());
    }

    @Test
    void testGetToken_InvalidResponse() {
        // Given
        when(restTemplate.postForEntity(
                anyString(),
                ArgumentMatchers.<Object>any(),
                eq(SociaalDomeinResponse.class)
        )).thenReturn(new ResponseEntity<>(null, HttpStatus.OK));

        // When / Assert
        SocialDomeinException ex = assertThrows(SocialDomeinException.class, () -> service.getToken());
        Assertions.assertEquals("SocialDomein error occurred", ex.getMessage());
    }

    @Test
    void testGetToken_CachePreventsMultipleCalls() throws Exception {
        // Given
        SociaalDomeinResponse response = new SociaalDomeinResponse("cached-token", 3600);
        when(restTemplate.postForEntity(
                anyString(),
                ArgumentMatchers.<Object>any(),
                eq(SociaalDomeinResponse.class)
        )).thenReturn(new ResponseEntity<>(response, HttpStatus.OK));

        // When
        String token1 = service.getToken();
        String token2 = service.getToken(); // Should reuse cached token

        // Assert
        Assertions.assertEquals("cached-token", token1);
        Assertions.assertEquals("cached-token", token2);

        // Verify RestTemplate called only once
        verify(restTemplate, times(1)).postForEntity(anyString(), any(), eq(SociaalDomeinResponse.class));
    }
}
