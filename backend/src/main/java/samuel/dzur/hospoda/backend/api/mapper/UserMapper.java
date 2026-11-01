package samuel.dzur.hospoda.backend.api.mapper;

import org.springframework.stereotype.Component;
import samuel.dzur.hospoda.backend.api.responses.OrderResponse;
import samuel.dzur.hospoda.backend.api.responses.RegistrationStatusResponse;
import samuel.dzur.hospoda.backend.api.responses.UserResponse;
import samuel.dzur.hospoda.backend.api.responses.UserWithOrdersResponse;
import samuel.dzur.hospoda.backend.dto.OrderDto;
import samuel.dzur.hospoda.backend.dto.UserDto;
import samuel.dzur.hospoda.backend.dto.UserWithOrdersDto;

import java.util.List;

@Component
public class UserMapper {

    public RegistrationStatusResponse toRegistrationStatusResponse(boolean complete) {
        return new RegistrationStatusResponse(complete);
    }

    public UserResponse toResponse(UserDto user) {
        return new UserResponse(
            user.id(),
            user.name(),
            user.isActive(),
            user.isAdult(),
            user.pocket()
        );
    }

    public UserWithOrdersResponse toResponse(UserWithOrdersDto user) {
        List<OrderResponse> orders = user.orders().stream()
            .map(this::toResponse)
            .toList();
        return new UserWithOrdersResponse(
            user.id(),
            user.name(),
            user.isActive(),
            user.isAdult(),
            user.pocket(),
            orders
        );
    }

    private OrderResponse toResponse(OrderDto order) {
        return new OrderResponse(
            order.id(),
            order.productName(),
            order.amount(),
            order.price()
        );
    }
}
