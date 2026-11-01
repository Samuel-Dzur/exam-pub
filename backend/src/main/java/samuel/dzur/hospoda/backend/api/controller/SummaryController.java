package samuel.dzur.hospoda.backend.api.controller;

import org.springframework.http.ResponseEntity;
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
import samuel.dzur.hospoda.backend.service.SummaryService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/summary")
public class SummaryController {

    private final SummaryService summaryService;
    private final SummaryMapper summaryMapper;

    public SummaryController(SummaryService summaryService, SummaryMapper summaryMapper) {
        this.summaryService = summaryService;
        this.summaryMapper = summaryMapper;
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
    public ResponseEntity<List<UserOrderSummaryResponse>> getOrdersByUserId(
            @PathVariable Long userId
    ) {
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
}
