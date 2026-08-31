package nl.centric.innovation.local4local.unit;

import nl.centric.innovation.local4local.security.SanitizerUtil;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class SanitizerUtilTest {

    @Test
    void givenBlankInput_whenSanitize_thenReturnNull() {
        assertNull(SanitizerUtil.sanitize(" "));
    }

    @Test
    void givenHtmlInput_whenSanitize_thenReturnSanitized() {
        String input = "<b>Test</b>";
        String result = SanitizerUtil.sanitize(input);
        assertNotNull(result);
        assertFalse(result.isEmpty());
    }

    @Test
    void givenInput_whenSanitizeWithMoreTags_thenReturnSanitized() {
        String input = "<div>Test</div>";
        String result = SanitizerUtil.sanitizeWithMoreTags(input);
        assertNotNull(result);
        assertFalse(result.isEmpty());
    }

    @Test
    void givenBlankInput_whenIsHtml_thenReturnFalse() {
        assertFalse(SanitizerUtil.isHtml(""));
    }

    @Test
    void givenPlainText_whenIsHtml_thenReturnFalse() {
        assertFalse(SanitizerUtil.isHtml("plain text"));
    }

    @Test
    void givenHtmlInput_whenIsHtml_thenReturnTrue() {
        assertTrue(SanitizerUtil.isHtml("<p>text</p>"));
    }
}