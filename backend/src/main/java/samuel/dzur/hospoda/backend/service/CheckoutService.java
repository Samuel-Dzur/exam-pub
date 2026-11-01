package samuel.dzur.hospoda.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import samuel.dzur.hospoda.backend.dto.CheckoutDto;
import samuel.dzur.hospoda.backend.exception.CheckoutException;
import samuel.dzur.hospoda.backend.repository.DrinkRepository;
import samuel.dzur.hospoda.backend.repository.OrderRepository;
import samuel.dzur.hospoda.backend.repository.UserRepository;
import samuel.dzur.hospoda.backend.repository.entity.DrinkEntity;
import samuel.dzur.hospoda.backend.repository.entity.OrderEntity;
import samuel.dzur.hospoda.backend.repository.entity.PriceRecordEntity;
import samuel.dzur.hospoda.backend.repository.entity.UserEntity;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class CheckoutService {

    private final UserRepository userRepository;
    private final DrinkRepository drinkRepository;
    private final OrderRepository orderRepository;

    public CheckoutService(
        UserRepository userRepository,
        DrinkRepository drinkRepository,
        OrderRepository orderRepository
    ) {
        this.userRepository = userRepository;
        this.drinkRepository = drinkRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional
    public CheckoutDto buy(String keycloakId, Long productId, Integer count) {
        UserEntity user = userRepository.findByKeycloakIdForUpdate(keycloakId)
            .orElseThrow(() -> new CheckoutException(
                CheckoutException.Code.CUSTOMER_NOT_FOUND,
                "Customer account was not found."
            ));

        DrinkEntity drink = drinkRepository.findById(productId)
            .orElseThrow(() -> new CheckoutException(
                CheckoutException.Code.DRINK_NOT_FOUND,
                "Drink was not found."
            ));

        if (Boolean.TRUE.equals(drink.getIsForAdult()) && !isAdult(user)) {
            throw new CheckoutException(
                CheckoutException.Code.ADULT_ONLY_DRINK,
                "This drink is only available to adults."
            );
        }

        PriceRecordEntity priceRecord = drink.getPriceRecords().stream()
            .findFirst()
            .orElseThrow(() -> new IllegalStateException(
                "Drink " + drink.getId() + " has no price records."
            ));

        BigDecimal total = priceRecord.getPrice().multiply(BigDecimal.valueOf(count));
        BigDecimal balance = user.getPocket();
        if (balance == null) {
            throw new IllegalStateException(
                "Customer " + user.getId() + " has no account balance."
            );
        }
        if (balance.compareTo(total) < 0) {
            throw new CheckoutException(
                CheckoutException.Code.INSUFFICIENT_BALANCE,
                "Insufficient account balance."
            );
        }

        BigDecimal remainingBalance = balance.subtract(total);
        user.setPocket(remainingBalance);

        OrderEntity order = new OrderEntity();
        order.setUser(user);
        order.setPriceRecord(priceRecord);
        order.setAmount(count);
        OrderEntity savedOrder = orderRepository.save(order);

        return new CheckoutDto(
            savedOrder.getId(),
            drink.getId(),
            count,
            total,
            remainingBalance
        );
    }

    private boolean isAdult(UserEntity user) {
        LocalDate birthDate = user.getBirthDate();
        return birthDate != null
            && !birthDate.isAfter(LocalDate.now().minusYears(18));
    }
}
