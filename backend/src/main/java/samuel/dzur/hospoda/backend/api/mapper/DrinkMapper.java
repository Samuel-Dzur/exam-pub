package samuel.dzur.hospoda.backend.api.mapper;

import org.springframework.stereotype.Component;
import samuel.dzur.hospoda.backend.api.responses.DrinkResponse;
import samuel.dzur.hospoda.backend.dto.DrinkDto;

@Component
public class DrinkMapper {

    public DrinkResponse toResponse(DrinkDto drink) {
        return new DrinkResponse(
            drink.id(),
            drink.productName(),
            drink.price(),
            drink.isForAdult()
        );
    }
}
