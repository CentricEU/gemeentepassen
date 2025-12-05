package nl.centric.innovation.local4local.infrastructure;

import org.springframework.http.HttpStatus;

public class OperationResult {
    private final boolean success;
    private final Reason reason;

    public boolean isSuccess() {
        return success;
    }

    public boolean isFailure() { return !success; }

    public Reason getReason() {
        return reason;
    }
    protected OperationResult(HttpStatus status) {
        this.success = true;
        this.reason = new Reason(status);
    }

    protected OperationResult(HttpStatus status, String message) {
        this.success = false;
        this.reason = new Reason(status, message);
    }

    public static OperationResult SuccessResult() {
        return new OperationResult(HttpStatus.NO_CONTENT);
    }

    public static OperationResult FailureResult(HttpStatus status, String message) {
        return new OperationResult(status, message);
    }

    public static OperationResult ExceptionResult(Exception exception) {
        return new OperationResult(HttpStatus.INTERNAL_SERVER_ERROR, exception.getMessage());
    }
}
