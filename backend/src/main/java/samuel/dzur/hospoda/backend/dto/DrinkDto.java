package samuel.dzur.hospoda.backend.dto;

import java.math.BigDecimal;

public record DrinkDto(
    Long id,
    String productName,
    BigDecimal price,
    Boolean isForAdult
) {
}
