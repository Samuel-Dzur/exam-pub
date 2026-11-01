package samuel.dzur.hospoda.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import samuel.dzur.hospoda.backend.api.responses.DrinkResponse;
import samuel.dzur.hospoda.backend.api.responses.ProductOrderSummaryResponse;
import samuel.dzur.hospoda.backend.api.responses.ProductSummaryResponse;
import samuel.dzur.hospoda.backend.api.responses.UserOrderSummaryResponse;
import samuel.dzur.hospoda.backend.repository.DrinkRepository;
import samuel.dzur.hospoda.backend.repository.OrderRepository;
import samuel.dzur.hospoda.backend.repository.UserRepository;
import samuel.dzur.hospoda.backend.repository.entity.DrinkEntity;
import samuel.dzur.hospoda.backend.repository.entity.OrderEntity;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class SummaryService {

    private final OrderRepository orderRepository;
    private final DrinkRepository drinkRepository;
    private final UserRepository userRepository;

    public SummaryService(
            OrderRepository orderRepository,
            DrinkRepository drinkRepository,
            UserRepository userRepository
    ) {
        this.orderRepository = orderRepository;
        this.drinkRepository = drinkRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Optional<List<ProductOrderSummaryResponse>> getOrdersByProductId(Long productId) {
        if (!drinkRepository.existsById(productId)) {
            return Optional.empty();
        }

        List<ProductOrderSummaryResponse> orders = orderRepository.findAllByDrinkIdWithUser(productId).stream()
            .map(order -> new ProductOrderSummaryResponse(
                order.getUser().getId(),
                order.getAmount(),
                orderTotal(order)
            ))
            .toList();

        return Optional.of(orders);
    }

    @Transactional(readOnly = true)
    public Optional<List<UserOrderSummaryResponse>> getOrdersByUserId(Long userId) {
        if (!userRepository.existsById(userId)) {
            return Optional.empty();
        }

        return Optional.of(orderRepository.findAllByUserIdWithDrink(userId).stream()
            .map(order -> new UserOrderSummaryResponse(
                order.getPriceRecord().getDrink().getId(),
                order.getPriceRecord().getDrink().getProductName(),
                order.getAmount(),
                orderTotal(order)
            ))
            .toList());
    }

    @Transactional(readOnly = true)
    public List<ProductSummaryResponse> getAllProductSummaries() {
        Map<Long, ProductSummaryAccumulator> summaries = new LinkedHashMap<>();

        for (OrderEntity order : orderRepository.findAllWithDrink()) {
            DrinkEntity drink = order.getPriceRecord().getDrink();
            ProductSummaryAccumulator summary = summaries.computeIfAbsent(
                drink.getId(),
                ignored -> new ProductSummaryAccumulator(drink)
            );
            summary.add(order);
        }

        return summaries.values().stream()
            .map(this::toResponse)
            .toList();
    }

    private ProductSummaryResponse toResponse(ProductSummaryAccumulator summary) {
        DrinkEntity drink = summary.drink;
        BigDecimal currentPrice = drink.getPriceRecords().stream()
            .findFirst()
            .orElseThrow(() -> new IllegalStateException(
                "Drink " + drink.getId() + " has no price records"
            ))
            .getPrice();
        
        return new ProductSummaryResponse(
            new DrinkResponse(
                drink.getId(),
                drink.getProductName(),
                currentPrice,
                drink.getIsForAdult()
            ),
            summary.amount,
            currentPrice,
            summary.summaryPrice
        );
    }

    private static BigDecimal orderTotal(OrderEntity order) {
        return order.getPriceRecord().getPrice()
                .multiply(BigDecimal.valueOf(order.getAmount()));
    }

    private static class ProductSummaryAccumulator {
        private final DrinkEntity drink;
        private int amount;
        private BigDecimal summaryPrice = BigDecimal.ZERO;

        private ProductSummaryAccumulator(DrinkEntity drink) {
            this.drink = drink;
        }

        private void add(OrderEntity order) {
            amount += order.getAmount();
            summaryPrice = summaryPrice.add(orderTotal(order));
        }
    }
}
