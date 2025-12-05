package nl.centric.innovation.local4local.exceptions;

import javax.servlet.ServletException;

public class DisabledRequestsException extends ServletException {
    public DisabledRequestsException(String message) {
        super(message);
    }
}
