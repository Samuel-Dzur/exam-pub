package samuel.dzur.hospoda.backend.dto;

import java.math.BigDecimal;

public record OrderDto(
    Long id,
    String productName,
    Integer amount,
    BigDecimal price
) {
}
