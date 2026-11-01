package samuel.dzur.hospoda.backend.api.responses;

import io.swagger.v3.oas.annotations.media.Schema;

public record RegistrationStatusResponse(
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED) boolean completed
) {
}
