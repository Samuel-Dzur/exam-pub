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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import samuel.dzur.hospoda.backend.security.annotation.BartenderOnly;
import samuel.dzur.hospoda.backend.security.annotation.CustomerOnly;
import samuel.dzur.hospoda.backend.api.requests.CompleteRegistrationRequest;
import samuel.dzur.hospoda.backend.api.responses.RegistrationStatusResponse;
import samuel.dzur.hospoda.backend.api.responses.UserResponse;
import samuel.dzur.hospoda.backend.api.responses.UserWithOrdersResponse;
import samuel.dzur.hospoda.backend.service.UserService;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT"
)
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users/registration")
    @CustomerOnly
    @Operation(security = @SecurityRequirement(name = "bearerAuth"))
    public RegistrationStatusResponse getRegistrationStatus(@AuthenticationPrincipal Jwt jwt) {
        return new RegistrationStatusResponse(userService.isRegistrationComplete(jwt.getSubject()));
    }

    @PostMapping("/users/registration")
    @CustomerOnly
    @Operation(security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Void> completeRegistration(
        @AuthenticationPrincipal Jwt jwt,
        @Valid @RequestBody CompleteRegistrationRequest request
    ) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Birth date is required.");
        }
        String username = jwt.getClaimAsString("preferred_username");
        if (username == null || username.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Keycloak token does not contain a username."
            );
        }
        userService.completeRegistration(
            jwt.getSubject(),
            username,
            LocalDate.parse(request.birthDate())
        );
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users")
    @BartenderOnly
    public ResponseEntity<List<UserResponse>> getUsers() {
        List<UserResponse> users = userService.getUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{id}")
    @BartenderOnly
    public ResponseEntity<UserWithOrdersResponse> getUserById(@PathVariable Long id) {
        Optional<UserWithOrdersResponse> user = userService.getUserById(id);
        if (user.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user.get());
    }
}
