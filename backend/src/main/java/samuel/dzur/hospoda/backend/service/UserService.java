package samuel.dzur.hospoda.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import samuel.dzur.hospoda.backend.api.responses.OrderResponse;
import samuel.dzur.hospoda.backend.api.responses.UserResponse;
import samuel.dzur.hospoda.backend.api.responses.UserWithOrdersResponse;
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
    public List<UserResponse> getUsers() {
        List<UserResponse> userResponses = userRepository.findAll().stream()
            .map(this::toUserResponse)
            .toList();

        return userResponses;
    }

    @Transactional(readOnly = true)
    public Optional<UserWithOrdersResponse> getUserByKeycloakId(String keycloakId) {
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

    private UserWithOrdersResponse toUserWithOrdersResponse(UserEntity user) {
        List<OrderResponse> orders = user.getOrders().stream()
            .map(this::toOrderResponse)
            .toList();

        return new UserWithOrdersResponse(
            user.getId(),
            user.getName(),
            user.getIsActive(),
            isAdult(user),
            user.getPocket(),
            orders
        );
    }

    private OrderResponse toOrderResponse(OrderEntity order) {
        BigDecimal totalPrice = order.getPriceRecord().getPrice()
            .multiply(BigDecimal.valueOf(order.getAmount()));

        return new OrderResponse(
            order.getId(),
            order.getPriceRecord().getDrink().getProductName(),
            order.getAmount(),
            totalPrice
        );
    }

    private UserResponse toUserResponse(UserEntity user) {
        return new UserResponse(
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
