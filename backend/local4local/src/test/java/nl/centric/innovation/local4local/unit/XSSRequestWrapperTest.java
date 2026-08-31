package nl.centric.innovation.local4local.unit;

import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import nl.centric.innovation.local4local.security.XSSRequestWrapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class XSSRequestWrapperTest {

    private HttpServletRequest requestMock;

    @BeforeEach
    void setUp() {
        // Default: JSON body
        requestMock = Mockito.mock(HttpServletRequest.class);
        Mockito.when(requestMock.getContentType()).thenReturn("application/json");
    }

    @Test
    void GivenJsonBodyWithHtml_WhenSanitizeJsonBody_ThenBodyIsSanitized() throws IOException {
        // Given
        String dirtyJson = "{\"a\":\"<b>hello</b>\"}";
        Mockito.when(requestMock.getInputStream())
                .thenReturn(toServletInputStream(dirtyJson));

        // When
        XSSRequestWrapper wrapper = new XSSRequestWrapper(requestMock);
        String sanitizedBody = new String(wrapper.getInputStream().readAllBytes(), StandardCharsets.UTF_8);

        // Then
        assertTrue(sanitizedBody.startsWith("{") && sanitizedBody.endsWith("}"),
                "Expected sanitizedBody to be JSON");

        assertTrue(sanitizedBody.contains("<b>hello</b>"),
                "Currently sanitizer keeps the full HTML; adjust this if you change SanitizerUtil.");
    }

    @Test
    void givenPlainTextBodyWithHtml_whenSanitizePlainTextBody_thenBodyIsUnchanged() throws IOException {
        // Given: for non-JSON (text/plain), body should NOT be sanitized
        Mockito.when(requestMock.getContentType()).thenReturn("text/plain");
        String body = "<script>alert('xss')</script>";
        Mockito.when(requestMock.getInputStream())
                .thenReturn(toServletInputStream(body));

        // When
        XSSRequestWrapper wrapper = new XSSRequestWrapper(requestMock);
        String sanitizedBody = new String(wrapper.getInputStream().readAllBytes(), StandardCharsets.UTF_8);

        // Then
        assertEquals(body, sanitizedBody,
                "Expected plain text body to be unchanged");
    }

    @Test
    void givenParamWithHtml_whenGetParameter_thenParameterIsSanitized() throws IOException {
        // Given: parameter with HTML
        String dirtyParam = "<a>test</a>";
        Mockito.when(requestMock.getParameter("p")).thenReturn(dirtyParam);

        // Some XSS wrappers also read the body in constructor; provide an empty stream
        Mockito.when(requestMock.getInputStream())
                .thenReturn(toServletInputStream(""));

        // When
        XSSRequestWrapper wrapper = new XSSRequestWrapper(requestMock);
        String sanitized = wrapper.getParameter("p");

        // Then
        assertNotNull(sanitized, "Sanitized parameter should not be null");
        assertFalse(sanitized.contains("<a>") || sanitized.contains("</a>"),
                "Expected <a> tags to be removed/escaped from parameter");
        assertTrue(sanitized.contains("test"),
                "Expected parameter to still contain text 'test'");
    }

    /**
     * Helper to wrap a String into a ServletInputStream.
     */
    private ServletInputStream toServletInputStream(String body) {
        ByteArrayInputStream bais =
                new ByteArrayInputStream(body.getBytes(StandardCharsets.UTF_8));

        return new ServletInputStream() {
            @Override
            public boolean isFinished() {
                return bais.available() == 0;
            }

            @Override
            public boolean isReady() {
                return true;
            }

            @Override
            public void setReadListener(ReadListener readListener) {
                // no-op for tests
            }

            @Override
            public int read() {
                return bais.read();
            }
        };
    }
}