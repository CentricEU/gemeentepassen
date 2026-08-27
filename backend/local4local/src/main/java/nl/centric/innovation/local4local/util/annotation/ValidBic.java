package nl.centric.innovation.local4local.util.annotation;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = CustomBicValidator.class)
@Target({ElementType.FIELD,
        ElementType.TYPE,
        ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidBic {
    String message() default "Invalid BIC format";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}

class CustomBicValidator implements ConstraintValidator<ValidBic, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) {
            return true; // allow null/blank values because this is no required field
        }

        String regexPattern = "^[A-Z0-9]{4}NL[A-Z0-9]{2}([A-Z0-9]{3})?$";

        return value.matches(regexPattern);
    }
}