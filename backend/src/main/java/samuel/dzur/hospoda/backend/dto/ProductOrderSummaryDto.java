package samuel.dzur.hospoda.backend.dto;

import java.math.BigDecimal;

public record ProductOrderSummaryDto(
    Long userId,
    Integer amount,
    BigDecimal price
) {
}
