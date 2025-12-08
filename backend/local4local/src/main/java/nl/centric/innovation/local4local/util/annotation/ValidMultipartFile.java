package nl.centric.innovation.local4local.util.annotation;

import javax.validation.Constraint;
import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import javax.validation.Payload;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.lang.annotation.*;

import static nl.centric.innovation.local4local.util.Constants.SUPPORTED_DOC;
import static nl.centric.innovation.local4local.util.Constants.SUPPORTED_PDF;
import static nl.centric.innovation.local4local.util.Constants.SUPPORTED_DOCX;
import static nl.centric.innovation.local4local.util.Constants.SUPPORTED_TXT;
import static nl.centric.innovation.local4local.util.Constants.MAX_FILE_BYTES_SIZE;

@Target({ ElementType.FIELD, ElementType.PARAMETER, ElementType.TYPE_USE })
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = MultipartFileConstraintValidator.class)
@Documented
public @interface ValidMultipartFile {

    String message() default "Invalid file";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}

class MultipartFileConstraintValidator implements ConstraintValidator<ValidMultipartFile, MultipartFile> {
    @Value("${error.document.fileIsEmptyOrNotProvided}")
    private String errorFileIsEmptyOrNotProvided;

    @Value("${error.document.typeNotAccepted}")
    private String errorTypeNotAccepted;

    @Value("${error.document.sizeExceeded}")
    private String errorSizeExceeded;

    private final List<String> allowedTypes = List.of(
            SUPPORTED_PDF,
            SUPPORTED_DOCX,
            SUPPORTED_DOC,
            SUPPORTED_TXT
    );

    @Override
    public boolean isValid(MultipartFile file, ConstraintValidatorContext context) {
        if (file == null || file.isEmpty()) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(errorFileIsEmptyOrNotProvided)
                   .addConstraintViolation();
            return false;
        }

        String contentType = file.getContentType();
        if (contentType == null || !allowedTypes.contains(contentType.toLowerCase())) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(errorTypeNotAccepted)
                    .addConstraintViolation();
            return false;
        }

        if (file.getSize() > MAX_FILE_BYTES_SIZE) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(errorSizeExceeded)
                    .addConstraintViolation();
            return false;
        }

        return true;
    }
}