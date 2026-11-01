package samuel.dzur.hospoda.backend.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import samuel.dzur.hospoda.backend.api.mapper.SummaryMapper;
import samuel.dzur.hospoda.backend.api.responses.ProductOrderSummaryResponse;
import samuel.dzur.hospoda.backend.api.responses.ProductSummaryResponse;
import samuel.dzur.hospoda.backend.api.responses.UserOrderSummaryResponse;
import samuel.dzur.hospoda.backend.dto.ProductOrderSummaryDto;
import samuel.dzur.hospoda.backend.dto.UserOrderSummaryDto;
import samuel.dzur.hospoda.backend.security.annotation.BartenderAccess;
import samuel.dzur.hospoda.backend.security.annotation.CustomerAccess;
import samuel.dzur.hospoda.backend.service.SummaryService;
import samuel.dzur.hospoda.backend.service.UserService;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@RestController
@RequestMapping("/summary")
public class SummaryController {

    private final SummaryService summaryService;
    private final SummaryMapper summaryMapper;
    private final UserService userService;

    public SummaryController(
        SummaryService summaryService,
        SummaryMapper summaryMapper,
        UserService userService
    ) {
        this.summaryService = summaryService;
        this.summaryMapper = summaryMapper;
        this.userService = userService;
    }

    @GetMapping("/product/{productId}")
    @BartenderAccess
    public ResponseEntity<List<ProductOrderSummaryResponse>> getOrdersByProductId(
            @PathVariable Long productId
    ) {
        Optional<List<ProductOrderSummaryDto>> orders =
                summaryService.getOrdersByProductId(productId);
        if (orders.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(orders.get().stream().map(summaryMapper::toResponse).toList());
    }

    @GetMapping("/user/{userId}")
    @BartenderAccess
    @CustomerAccess
    @Operation(security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<UserOrderSummaryResponse>> getOrdersByUserId(
            @PathVariable Long userId,
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication
    ) {
        boolean isBartender = authentication.getAuthorities().stream()
            .anyMatch(authority -> authority.getAuthority().equals("ROLE_BARTENDER"));
        if (!isBartender && !isOwnUserId(userId, jwt)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Optional<List<UserOrderSummaryDto>> orders = summaryService.getOrdersByUserId(userId);
        if (orders.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(orders.get().stream().map(summaryMapper::toResponse).toList());
    }

    @GetMapping("/all")
    @BartenderAccess
    public ResponseEntity<List<ProductSummaryResponse>> getAllProductSummaries() {
        List<ProductSummaryResponse> summaries = summaryService.getAllProductSummaries().stream()
            .map(summaryMapper::toResponse)
            .toList();
        return ResponseEntity.ok(summaries);
    }

    private boolean isOwnUserId(Long requestedUserId, Jwt jwt) {
        return userService.getUserIdByKeycloakId(jwt.getSubject())
            .filter(userId -> Objects.equals(userId, requestedUserId))
            .isPresent();
    }
}
