package samuel.dzur.hospoda.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import samuel.dzur.hospoda.backend.dto.DrinkDto;
import samuel.dzur.hospoda.backend.repository.DrinkRepository;
import samuel.dzur.hospoda.backend.repository.entity.DrinkEntity;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;

@Service
public class DrinkService {

    private final DrinkRepository drinkRepository;
    private final Path storageRoot;

    public DrinkService(
            DrinkRepository drinkRepository,
            @Value("${app.storage.root:storage}") String storageRoot
    ) {
        this.drinkRepository = drinkRepository;
        this.storageRoot = Path.of(storageRoot).toAbsolutePath().normalize();
    }

    @Transactional(readOnly = true)
    public List<DrinkDto> getDrinkMenu() {
        return drinkRepository.findAll().stream()
            .map(
                entity -> new DrinkDto(
                    entity.getId(),
                    entity.getProductName(),
                    getCurrentPrice(entity),
                    entity.getIsForAdult()
                )
            )
            .toList();
    }

    public Optional<Path> getDrinkImage(Long drinkId) {
        Path image = storageRoot.resolve("drinks").resolve(drinkId + ".webp").normalize();
        if (!image.startsWith(storageRoot)) {
            return Optional.empty();
        }

        try {
            Path realStorageRoot = storageRoot.toRealPath();
            Path realImage = image.toRealPath();
            if (!realImage.startsWith(realStorageRoot)
                    || !Files.isRegularFile(realImage)
                    || !Files.isReadable(realImage)) {
                return Optional.empty();
            }
            return Optional.of(realImage);
        } catch (NoSuchFileException e) {
            return Optional.empty();
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to access drink image " + drinkId, e);
        }
    }

    private BigDecimal getCurrentPrice(DrinkEntity drink) {
        return drink.getPriceRecords().stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException(
                        "Drink " + drink.getId() + " has no price records"
                ))
                .getPrice();
    }
}
