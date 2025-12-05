package nl.centric.innovation.local4local.exceptions;

// Todo: refactor this whole directory to collapse (almost) all exceptions into a single file -> reference: L4L-EU
public class InvoiceGenerationException extends RuntimeException {
    public InvoiceGenerationException(String message, Throwable cause) {
        super(message, cause);
    }
}
