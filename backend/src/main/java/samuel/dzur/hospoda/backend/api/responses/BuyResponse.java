package samuel.dzur.hospoda.backend.api.responses;

import java.math.BigDecimal;

public record BuyResponse(
    Long orderId,
    Long productId,
    Integer count,
    BigDecimal total,
    BigDecimal remainingBalance
) {
}
