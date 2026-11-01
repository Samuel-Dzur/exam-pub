package samuel.dzur.hospoda.backend.api.requests;

import io.swagger.v3.oas.annotations.media.Schema;
import samuel.dzur.hospoda.backend.api.validation.ValidBirthDate;

public record CompleteRegistrationRequest(
    @ValidBirthDate
    @Schema(type = "string", format = "date", example = "2000-02-29")
    String birthDate
) {
}
