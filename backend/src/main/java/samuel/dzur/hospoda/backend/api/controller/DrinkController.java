package samuel.dzur.hospoda.backend.api.controller;

import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import samuel.dzur.hospoda.backend.api.responses.DrinkResponse;
import samuel.dzur.hospoda.backend.security.annotation.PublicEndpoint;
import samuel.dzur.hospoda.backend.service.DrinkService;

import java.util.List;
import java.util.Optional;

@RestController
public class DrinkController {

    private final DrinkService drinkService;

    public DrinkController(DrinkService drinkService) {
        this.drinkService = drinkService;
    }

    @GetMapping("/drink-menu")
    @PublicEndpoint
    public ResponseEntity<List<DrinkResponse>> getDrinkMenu() {
        List<DrinkResponse> drinks = drinkService.getDrinkMenu();
        return ResponseEntity.ok(drinks);
    }

    @GetMapping(value = "/image/{id}", produces = "image/webp")
    @PublicEndpoint
    public ResponseEntity<Resource> getDrinkImage(@PathVariable Long id) {
        Optional<Resource> image = drinkService.getDrinkImage(id);
        if (image.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("image/webp"))
                .body(image.get());
    }
}
