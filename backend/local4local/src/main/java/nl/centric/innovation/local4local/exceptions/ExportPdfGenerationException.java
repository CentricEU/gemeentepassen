package nl.centric.innovation.local4local.exceptions;

// Todo: refactor this whole directory to collapse (almost) all exceptions into a single file -> reference: L4L-EU
public class ExportPdfGenerationException extends RuntimeException {
    public ExportPdfGenerationException(String message, Throwable cause) {
        super(message, cause);
    }
}
