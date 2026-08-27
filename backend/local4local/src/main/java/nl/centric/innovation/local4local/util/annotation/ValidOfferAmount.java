package nl.centric.innovation.local4local.util.annotation;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;
import nl.centric.innovation.local4local.dto.OfferRequestDto;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Documented
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = AmountConditionalValidator.class)
public @interface ValidOfferAmount {
    String message() default "Invalid amount";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}

class AmountConditionalValidator
        implements ConstraintValidator<ValidOfferAmount, OfferRequestDto> {

    @Override
    public void initialize(ValidOfferAmount constraintAnnotation) {
        // No initialization required
    }

    @Override
    public boolean isValid(
            OfferRequestDto dto,
            ConstraintValidatorContext context
    ) {
        if (dto == null) {
            return true;
        }

        Integer offerTypeId = dto.offerTypeId();
        Double amount = dto.amount();

        boolean valid;

        if (dto.offerTypeId() == 3) {
            valid = dto.amount() != null;
        } else {
            valid = dto.amount() == null;
        }

        if (!valid) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                            errorMessage(offerTypeId)
                    )
                    .addPropertyNode("amount")
                    .addConstraintViolation();
        }
        return valid;
    }

    private String errorMessage(Integer offerTypeId) {
        if (offerTypeId == 3) {
            return "Amount is required for this offer type";
        }
        return "Amount is not allowed for this offer type";
    }
}