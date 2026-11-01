package samuel.dzur.hospoda.backend.api.mapper;

import org.springframework.stereotype.Component;
import samuel.dzur.hospoda.backend.api.responses.BuyResponse;
import samuel.dzur.hospoda.backend.dto.CheckoutDto;

@Component
public class CheckoutMapper {

    public BuyResponse toResponse(CheckoutDto result) {
        return new BuyResponse(
            result.orderId(),
            result.productId(),
            result.count(),
            result.total(),
            result.remainingBalance()
        );
    }
}
