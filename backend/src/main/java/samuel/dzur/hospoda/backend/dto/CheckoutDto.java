package samuel.dzur.hospoda.backend.dto;

import java.math.BigDecimal;

public record CheckoutDto(
    Long orderId,
    Long productId,
    Integer count,
    BigDecimal total,
    BigDecimal remainingBalance
) {
}
