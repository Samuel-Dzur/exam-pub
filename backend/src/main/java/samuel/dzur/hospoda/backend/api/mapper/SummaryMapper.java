package samuel.dzur.hospoda.backend.api.mapper;

import org.springframework.stereotype.Component;
import samuel.dzur.hospoda.backend.api.responses.ProductOrderSummaryResponse;
import samuel.dzur.hospoda.backend.api.responses.ProductSummaryResponse;
import samuel.dzur.hospoda.backend.api.responses.UserOrderSummaryResponse;
import samuel.dzur.hospoda.backend.dto.ProductOrderSummaryDto;
import samuel.dzur.hospoda.backend.dto.ProductSummaryDto;
import samuel.dzur.hospoda.backend.dto.UserOrderSummaryDto;

@Component
public class SummaryMapper {

    private final DrinkMapper drinkMapper;

    public SummaryMapper(DrinkMapper drinkMapper) {
        this.drinkMapper = drinkMapper;
    }

    public ProductOrderSummaryResponse toResponse(ProductOrderSummaryDto summary) {
        return new ProductOrderSummaryResponse(
            summary.userId(),
            summary.amount(),
            summary.price()
        );
    }

    public UserOrderSummaryResponse toResponse(UserOrderSummaryDto summary) {
        return new UserOrderSummaryResponse(
            summary.productId(),
            summary.productName(),
            summary.amount(),
            summary.price()
        );
    }

    public ProductSummaryResponse toResponse(ProductSummaryDto summary) {
        return new ProductSummaryResponse(
            drinkMapper.toResponse(summary.product()),
            summary.amount(),
            summary.unitPrice(),
            summary.summaryPrice()
        );
    }
}
