package nl.centric.innovation.local4local.util.annotation;

import java.lang.annotation.*;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static nl.centric.innovation.local4local.util.Constants.MAX_FILE_LIST_COUNT;


@Target({ ElementType.FIELD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = MultipartFileListConstraintValidator.class)
@Documented
public @interface ValidMultipartFileList {

    String message() default "Invalid file list";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}

class MultipartFileListConstraintValidator implements ConstraintValidator<ValidMultipartFileList, List<MultipartFile>> {
    @Value("${error.documents.tooMany}")
    private String errorTooManyFiles;

    @Value("${error.document.duplicateName}")
    private String errorDuplicateDocumentName;


    @Override
    public boolean isValid(List<MultipartFile> files, ConstraintValidatorContext context) {
        if (files == null || files.isEmpty()) return true;

        if (files.size() > MAX_FILE_LIST_COUNT) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(errorTooManyFiles)
                    .addConstraintViolation();
            return false;
        }

        Set<String> names = new HashSet<>();
        for (MultipartFile file : files) {
            if (file != null && file.getOriginalFilename() != null) {
                if (!names.add(file.getOriginalFilename())) {
                    context.disableDefaultConstraintViolation();
                    context.buildConstraintViolationWithTemplate(errorDuplicateDocumentName)
                            .addConstraintViolation();
                    return false;
                }
            }
        }

        return true;
    }
}