package samuel.dzur.hospoda.backend.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import samuel.dzur.hospoda.backend.security.annotation.BartenderOnly;
import samuel.dzur.hospoda.backend.api.responses.ProductOrderSummaryResponse;
import samuel.dzur.hospoda.backend.api.responses.ProductSummaryResponse;
import samuel.dzur.hospoda.backend.api.responses.UserOrderSummaryResponse;
import samuel.dzur.hospoda.backend.service.SummaryService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/summary")
public class SummaryController {

    private final SummaryService summaryService;

    public SummaryController(SummaryService summaryService) {
        this.summaryService = summaryService;
    }

    @GetMapping("/product/{productId}")
    @BartenderOnly
    public ResponseEntity<List<ProductOrderSummaryResponse>> getOrdersByProductId(
            @PathVariable Long productId
    ) {
        Optional<List<ProductOrderSummaryResponse>> orders =
                summaryService.getOrdersByProductId(productId);
        if (orders.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(orders.get());
    }

    @GetMapping("/user/{userId}")
    @BartenderOnly
    public ResponseEntity<List<UserOrderSummaryResponse>> getOrdersByUserId(
            @PathVariable Long userId
    ) {
        Optional<List<UserOrderSummaryResponse>> orders = summaryService.getOrdersByUserId(userId);
        if (orders.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(orders.get());
    }

    @GetMapping("/all")
    @BartenderOnly
    public ResponseEntity<List<ProductSummaryResponse>> getAllProductSummaries() {
        List<ProductSummaryResponse> summaries = summaryService.getAllProductSummaries();
        return ResponseEntity.ok(summaries);
    }
}
