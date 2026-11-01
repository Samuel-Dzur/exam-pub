package samuel.dzur.hospoda.backend.api.handler;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import samuel.dzur.hospoda.backend.exception.CheckoutException;

@RestControllerAdvice
public class CheckoutExceptionHandler {

    @ExceptionHandler(CheckoutException.class)
    public ResponseEntity<ProblemDetail> handleCheckoutException(CheckoutException exception) {
        HttpStatus status = switch (exception.getCode()) {
            case CUSTOMER_NOT_FOUND, DRINK_NOT_FOUND -> HttpStatus.NOT_FOUND;
            case ADULT_ONLY_DRINK -> HttpStatus.FORBIDDEN;
            case INSUFFICIENT_BALANCE -> HttpStatus.CONFLICT;
        };
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, exception.getMessage());
        return ResponseEntity.status(status).body(problem);
    }
}
