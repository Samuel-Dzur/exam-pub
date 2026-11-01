package samuel.dzur.hospoda.backend.dto;

import java.math.BigDecimal;

public record UserOrderSummaryDto(
    Long productId,
    String productName,
    Integer amount,
    BigDecimal price
) {
}
