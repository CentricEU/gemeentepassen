package nl.centric.innovation.local4local.util.annotation;

import org.apache.commons.lang3.StringUtils;

import javax.validation.Constraint;
import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import javax.validation.Payload;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import com.prowidesoftware.swift.model.IBAN;

@Constraint(validatedBy = CustomIbanValidator.class)
@Target({
        ElementType.FIELD,
        ElementType.TYPE,
        ElementType.METHOD
})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidIban {
    String message() default "Invalid IBAN format";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}

class CustomIbanValidator implements ConstraintValidator<ValidIban, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (StringUtils.isBlank(value)) {
            return false;
        }

        // Check if the value starts with "NL" and has the correct length and format
        // The IBAN for the Netherlands starts with "NL", followed by 2 digits, 4 letters, and 10 digits.
        // This regular expression is necessary because the prowidesoftware library does not
        // support checking for the Netherlands country only, and we now only support that.

        String regexPattern = "^NL\\d{2}[A-Z]{4}\\d{10}$";

        if (!value.matches(regexPattern)) {
            return false;
        }

        IBAN iban = new IBAN(value);
        return iban.isValid();
    }
}