package samuel.dzur.hospoda.backend.api.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.format.ResolverStyle;

public class BirthDateValidator implements ConstraintValidator<ValidBirthDate, String> {

    private static final DateTimeFormatter ISO_DATE =
        DateTimeFormatter.ofPattern("uuuu-MM-dd").withResolverStyle(ResolverStyle.STRICT);

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Birth date is required.")
                .addConstraintViolation();
            return false;
        }

        try {
            return !LocalDate.parse(value, ISO_DATE).isAfter(LocalDate.now());
        } catch (DateTimeParseException exception) {
            return false;
        }
    }
}
