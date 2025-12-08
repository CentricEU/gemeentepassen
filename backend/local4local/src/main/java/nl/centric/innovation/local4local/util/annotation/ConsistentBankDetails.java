package nl.centric.innovation.local4local.util.annotation;

import org.apache.commons.lang3.StringUtils;

import javax.validation.Constraint;
import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import javax.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ConsistentBankDetailsValidator.class)
@Documented
public @interface ConsistentBankDetails {
    String message() default "IBAN and BIC bank codes do not match";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}

class ConsistentBankDetailsValidator implements ConstraintValidator<ConsistentBankDetails, BankDetailsProvider> {

    @Override
    public boolean isValid(BankDetailsProvider dto, ConstraintValidatorContext context) {
        String iban = dto.iban();
        String bic = dto.bic();

        if (StringUtils.isBlank(bic)) {
            return true; // allow null/blank values because this is no required field
        }

        String ibanBankCode = iban.substring(4, 8);
        String bicBankCode = bic.substring(0, 4);

        if (!ibanBankCode.equalsIgnoreCase(bicBankCode)) {
            context.disableDefaultConstraintViolation();
            context
                    .buildConstraintViolationWithTemplate("IBAN and BIC bank codes do not match: " + ibanBankCode + " vs " + bicBankCode)
                    .addPropertyNode("bic")
                    .addConstraintViolation();
            return false;
        }

        return true;
    }
}