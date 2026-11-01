package samuel.dzur.hospoda.backend.api.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import samuel.dzur.hospoda.backend.api.mapper.CheckoutMapper;
import samuel.dzur.hospoda.backend.api.requests.BuyRequest;
import samuel.dzur.hospoda.backend.api.responses.BuyResponse;
import samuel.dzur.hospoda.backend.dto.CheckoutDto;
import samuel.dzur.hospoda.backend.security.annotation.CustomerAccess;
import samuel.dzur.hospoda.backend.service.CheckoutService;

@RestController
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT"
)
public class CheckoutController {

    private final CheckoutService checkoutService;
    private final CheckoutMapper checkoutMapper;

    public CheckoutController(CheckoutService checkoutService, CheckoutMapper checkoutMapper) {
        this.checkoutService = checkoutService;
        this.checkoutMapper = checkoutMapper;
    }

    @PostMapping("/buy")
    @CustomerAccess
    @Operation(security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<BuyResponse> buy(
        @AuthenticationPrincipal Jwt jwt,
        @Valid @RequestBody BuyRequest request
    ) {
        CheckoutDto result = checkoutService.buy(
            jwt.getSubject(),
            request.productId(),
            request.count()
        );
        BuyResponse response = checkoutMapper.toResponse(result);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
