package nl.centric.innovation.local4local.infrastructure;

import org.springframework.http.HttpStatus;

public record Reason(HttpStatus httpStatus, String message) {
    public Reason {
    }

    public Reason(HttpStatus httpStatus) {
        this(httpStatus, null);
    }
}