package com.boomnails.adapter.in.web;

import org.springframework.dao.InvalidDataAccessApiUsageException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class PaymentReviewExceptionHandler {

    @ExceptionHandler(InvalidDataAccessApiUsageException.class)
    public ResponseEntity<Map<String, String>> handlePaymentReviewException(
            InvalidDataAccessApiUsageException exception
    ) {
        Throwable cause = exception.getMostSpecificCause();
        String message = cause.getMessage();

        if (message != null
                && message.contains("El pago ya fue revisado")) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    Map.of(
                            "message",
                            "Este pago ya fue revisado. No se modificó el inventario."
                    )
            );
        }

        if (cause instanceof IllegalArgumentException
                && message != null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    Map.of("message", message)
            );
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("message", "No fue posible procesar la solicitud.")
        );
    }
}