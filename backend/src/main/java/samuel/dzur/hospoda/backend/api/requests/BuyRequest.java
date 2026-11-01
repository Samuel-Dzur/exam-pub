package samuel.dzur.hospoda.backend.api.requests;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record BuyRequest(
    @NotNull @Positive Long productId,
    @NotNull @Positive Integer count
) {
}
