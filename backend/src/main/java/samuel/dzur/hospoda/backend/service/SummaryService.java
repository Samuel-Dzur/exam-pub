package samuel.dzur.hospoda.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import samuel.dzur.hospoda.backend.dto.DrinkDto;
import samuel.dzur.hospoda.backend.dto.ProductOrderSummaryDto;
import samuel.dzur.hospoda.backend.dto.ProductSummaryDto;
import samuel.dzur.hospoda.backend.dto.UserOrderSummaryDto;
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
    public Optional<List<ProductOrderSummaryDto>> getOrdersByProductId(Long productId) {
        if (!drinkRepository.existsById(productId)) {
            return Optional.empty();
        }

        List<ProductOrderSummaryDto> orders = orderRepository.findAllByDrinkIdWithUser(productId).stream()
            .map(order -> new ProductOrderSummaryDto(
                order.getUser().getId(),
                order.getAmount(),
                orderTotal(order)
            ))
            .toList();

        return Optional.of(orders);
    }

    @Transactional(readOnly = true)
    public Optional<List<UserOrderSummaryDto>> getOrdersByUserId(Long userId) {
        if (!userRepository.existsById(userId)) {
            return Optional.empty();
        }

        return Optional.of(orderRepository.findAllByUserIdWithDrink(userId).stream()
            .map(order -> new UserOrderSummaryDto(
                order.getPriceRecord().getDrink().getId(),
                order.getPriceRecord().getDrink().getProductName(),
                order.getAmount(),
                orderTotal(order)
            ))
            .toList());
    }

    @Transactional(readOnly = true)
    public List<ProductSummaryDto> getAllProductSummaries() {
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

    private ProductSummaryDto toResponse(ProductSummaryAccumulator summary) {
        DrinkEntity drink = summary.drink;
        BigDecimal currentPrice = drink.getPriceRecords().stream()
            .findFirst()
            .orElseThrow(() -> new IllegalStateException(
                "Drink " + drink.getId() + " has no price records"
            ))
            .getPrice();
        
        return new ProductSummaryDto(
            new DrinkDto(
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
