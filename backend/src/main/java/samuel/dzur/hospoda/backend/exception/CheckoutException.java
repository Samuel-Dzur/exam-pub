package samuel.dzur.hospoda.backend.exception;

public class CheckoutException extends RuntimeException {

    public enum Code {
        CUSTOMER_NOT_FOUND,
        DRINK_NOT_FOUND,
        ADULT_ONLY_DRINK,
        INSUFFICIENT_BALANCE
    }

    private final Code code;

    public CheckoutException(Code code, String message) {
        super(message);
        this.code = code;
    }

    public Code getCode() {
        return code;
    }
}
