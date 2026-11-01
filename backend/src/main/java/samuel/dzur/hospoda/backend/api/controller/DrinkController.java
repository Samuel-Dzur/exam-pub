package samuel.dzur.hospoda.backend.api.controller;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import samuel.dzur.hospoda.backend.api.mapper.DrinkMapper;
import samuel.dzur.hospoda.backend.api.responses.DrinkResponse;
import samuel.dzur.hospoda.backend.security.annotation.PublicEndpoint;
import samuel.dzur.hospoda.backend.service.DrinkService;

import java.nio.file.Path;
import java.util.List;
import java.util.Optional;

@RestController
public class DrinkController {

    private final DrinkService drinkService;
    private final DrinkMapper drinkMapper;

    public DrinkController(DrinkService drinkService, DrinkMapper drinkMapper) {
        this.drinkService = drinkService;
        this.drinkMapper = drinkMapper;
    }

    @GetMapping("/drink-menu")
    @PublicEndpoint
    public ResponseEntity<List<DrinkResponse>> getDrinkMenu() {
        List<DrinkResponse> drinks = drinkService.getDrinkMenu().stream()
            .map(drinkMapper::toResponse)
            .toList();
        return ResponseEntity.ok(drinks);
    }

    @GetMapping(value = "/image/{id}", produces = "image/webp")
    @PublicEndpoint
    public ResponseEntity<Resource> getDrinkImage(@PathVariable Long id) {
        Optional<Path> image = drinkService.getDrinkImage(id);
        if (image.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("image/webp"))
                .body(new FileSystemResource(image.get()));
    }

}
