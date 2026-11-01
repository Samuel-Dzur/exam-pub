package samuel.dzur.hospoda.backend.dto;

import java.math.BigDecimal;

public record UserDto(
    Long id,
    String name,
    Boolean isActive,
    Boolean isAdult,
    BigDecimal pocket
) {
}
