package samuel.dzur.hospoda.backend.dto;

import java.math.BigDecimal;

public record ProductSummaryDto(
    DrinkDto product,
    Integer amount,
    BigDecimal unitPrice,
    BigDecimal summaryPrice
) {
}
