package samuel.dzur.hospoda.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import samuel.dzur.hospoda.backend.dto.OrderDto;
import samuel.dzur.hospoda.backend.dto.UserDto;
import samuel.dzur.hospoda.backend.dto.UserWithOrdersDto;
import samuel.dzur.hospoda.backend.repository.UserRepository;
import samuel.dzur.hospoda.backend.repository.entity.OrderEntity;
import samuel.dzur.hospoda.backend.repository.entity.UserEntity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private static final BigDecimal NEW_USER_BUDGET = BigDecimal.valueOf(800);
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<UserDto> getUsers() {
        return userRepository.findAll().stream()
            .map(this::toUserResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public Optional<UserWithOrdersDto> getUserByKeycloakId(String keycloakId) {
        return userRepository.findByKeycloakId(keycloakId)
            .map(this::toUserWithOrdersResponse);
    }

    @Transactional(readOnly = true)
    public boolean isRegistrationComplete(String keycloakId) {
        return userRepository.findByKeycloakId(keycloakId)
            .map(user -> user.getBirthDate() != null)
            .orElse(false);
    }

    @Transactional
    public void completeRegistration(String keycloakId, String username, LocalDate birthDate) {
        if (birthDate == null || birthDate.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Birth date must be today or earlier.");
        }

        UserEntity user = userRepository.findByKeycloakId(keycloakId)
            .orElseGet(UserEntity::new);
        if (user.getBirthDate() != null) {
            return;
        }

        boolean isNewUser = user.getId() == null;
        user.setKeycloakId(keycloakId);
        user.setName(username);
        user.setBirthDate(birthDate);
        if (isNewUser) {
            user.setIsActive(true);
            user.setPocket(NEW_USER_BUDGET);
        }
        userRepository.save(user);
    }

    private UserWithOrdersDto toUserWithOrdersResponse(UserEntity user) {
        List<OrderDto> orders = user.getOrders().stream()
            .map(this::toOrderResponse)
            .toList();

        return new UserWithOrdersDto(
            user.getId(),
            user.getName(),
            user.getIsActive(),
            isAdult(user),
            user.getPocket(),
            orders
        );
    }

    private OrderDto toOrderResponse(OrderEntity order) {
        BigDecimal totalPrice = order.getPriceRecord().getPrice()
            .multiply(BigDecimal.valueOf(order.getAmount()));

        return new OrderDto(
            order.getId(),
            order.getPriceRecord().getDrink().getProductName(),
            order.getAmount(),
            totalPrice
        );
    }

    private UserDto toUserResponse(UserEntity user) {
        return new UserDto(
            user.getId(),
            user.getName(),
            user.getIsActive(),
            isAdult(user),
            user.getPocket()
        );
    }

    private boolean isAdult(UserEntity user) {
        LocalDate birthDate = user.getBirthDate();
        return birthDate != null && !birthDate.isAfter(LocalDate.now().minusYears(18));
    }
}
