package nl.centric.innovation.local4local.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.TextNode;

import javax.servlet.ReadListener;
import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import java.util.Spliterator;
import java.util.Spliterators;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

/**
 * Wraps HttpServletRequest to sanitize input and prevent XSS attacks.
 * Cleans JSON bodies and request parameters using SanitizerUtil.
 */
public class XSSRequestWrapper extends HttpServletRequestWrapper {

    private static final ObjectMapper objectMapper = new ObjectMapper();
    private final byte[] sanitizedBodyBytes;

    public XSSRequestWrapper(HttpServletRequest request) throws IOException {
        super(request);
        this.sanitizedBodyBytes = extractAndSanitizeBody(request);
    }

    /**
     * Reads and sanitizes the request body if it's JSON.
     */
    private byte[] extractAndSanitizeBody(HttpServletRequest request) throws IOException {
        String body = readRequestBody();
        return isJson(request) ? sanitizeJsonBody(body) : body.getBytes();
    }

    /**
     * Reads the raw body from the request.
     */
    private String readRequestBody() throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(super.getInputStream()))) {
            return reader.lines().collect(Collectors.joining(System.lineSeparator()));
        }
    }

    /**
     * Checks if the content type is JSON.
     */
    private boolean isJson(HttpServletRequest request) {
        return Optional.ofNullable(request.getContentType())
                .map(contentType -> contentType.contains("application/json"))
                .orElse(false);
    }

    /**
     * Parses and sanitizes a JSON body.
     */
    private byte[] sanitizeJsonBody(String body) throws IOException {
        JsonNode root = objectMapper.readTree(body);
        sanitizeNode(root);
        return objectMapper.writeValueAsBytes(root);
    }

    /**
     * Recursively sanitizes all nodes in a JSON tree.
     */
    private void sanitizeNode(JsonNode node) {
        if (node.isObject()) {
            node.fields().forEachRemaining(field -> field.setValue(sanitize(field.getValue())));
        } else {
            StreamSupport.stream(Spliterators.spliteratorUnknownSize(node.elements(), Spliterator.ORDERED), false)
                    .forEach(this::sanitize);
        }
    }

    /**
     * Sanitizes a JSON node if it contains text.
     */
    private JsonNode sanitize(JsonNode node) {
        if (node.isTextual()) {
            String textValue = node.textValue();

            return new TextNode(SanitizerUtil.isHtml(textValue)
                    ? SanitizerUtil.sanitizeWithMoreTags(textValue)
                    : SanitizerUtil.sanitize(textValue));
        }
        sanitizeNode(node);
        return node;
    }

    /**
     * Returns sanitized input stream.
     */
    @Override
    public ServletInputStream getInputStream() {
        ByteArrayInputStream bais = new ByteArrayInputStream(sanitizedBodyBytes);
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
                // This method is intentionally left empty as it is not required for this implementation.
            }

            @Override
            public int read() {
                return bais.read();
            }
        };
    }

    /**
     * Returns a reader for the sanitized input.
     */
    @Override
    public BufferedReader getReader() {
        return new BufferedReader(new InputStreamReader(getInputStream()));
    }

    /**
     * Returns a sanitized single parameter.
     */
    @Override
    public String getParameter(String name) {
        return Optional.ofNullable(super.getParameter(name))
                .map(SanitizerUtil::sanitize)
                .orElse(null);
    }

    /**
     * Returns sanitized parameter values.
     */
    @Override
    public String[] getParameterValues(String name) {
        return Optional.ofNullable(super.getParameterValues(name))
                .map(values -> Arrays.stream(values)
                        .map(SanitizerUtil::sanitize)
                        .toArray(String[]::new))
                .orElse(null);
    }

    /**
     * Returns a sanitized parameter map.
     */
    @Override
    public Map<String, String[]> getParameterMap() {
        return super.getParameterMap().entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> Arrays.stream(entry.getValue())
                                .map(SanitizerUtil::sanitize)
                                .toArray(String[]::new)
                ));
    }
}
