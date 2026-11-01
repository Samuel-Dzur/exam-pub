package samuel.dzur.hospoda.backend.api.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = BirthDateValidator.class)
public @interface ValidBirthDate {

    String message() default "Birth date must be a valid date in yyyy-MM-dd format and not in the future.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
