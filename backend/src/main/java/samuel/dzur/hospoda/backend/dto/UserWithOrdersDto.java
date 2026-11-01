package samuel.dzur.hospoda.backend.dto;

import java.math.BigDecimal;
import java.util.List;

public record UserWithOrdersDto(
    Long id,
    String name,
    Boolean isActive,
    Boolean isAdult,
    BigDecimal pocket,
    List<OrderDto> orders
) {
}
