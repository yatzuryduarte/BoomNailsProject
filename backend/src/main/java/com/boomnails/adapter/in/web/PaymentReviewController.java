
package com.boomnails.adapter.in.web;

import com.boomnails.application.service.ReviewPaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/payments")
public class PaymentReviewController {

    private final ReviewPaymentService reviewPaymentService;
    private final JdbcTemplate jdbcTemplate;

    public PaymentReviewController(
            ReviewPaymentService reviewPaymentService,
            JdbcTemplate jdbcTemplate
    ) {
        this.reviewPaymentService = reviewPaymentService;
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostMapping("/{paymentId}/approve")
    public ResponseEntity<Map<String, String>> approve(
            @PathVariable Long paymentId,
            Authentication authentication
    ) {
        Long adminUserId = getAdminUserId(authentication);

        reviewPaymentService.approve(paymentId, adminUserId);

        return ResponseEntity.ok(
                Map.of("message", "Pago aprobado y pedido confirmado.")
        );
    }

    @PostMapping("/{paymentId}/reject")
    public ResponseEntity<Map<String, String>> reject(
            @PathVariable Long paymentId,
            @RequestBody RejectPaymentRequest request,
            Authentication authentication
    ) {
        Long adminUserId = getAdminUserId(authentication);

        if (request == null || request.reason() == null
                || request.reason().isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Debes indicar el motivo del rechazo.")
            );
        }

        reviewPaymentService.reject(
                paymentId,
                adminUserId,
                request.reason()
        );

        return ResponseEntity.ok(
                Map.of("message", "Comprobante rechazado.")
        );
    }

    private Long getAdminUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Debes iniciar sesión como administrador."
            );
        }

        return jdbcTemplate.queryForObject("""
            SELECT id_usuario
            FROM usuario
            WHERE correo = ?
              AND rol = 'ADMIN'
              AND estado = 'ACTIVO'
            """, Long.class, authentication.getName());
    }

    public record RejectPaymentRequest(String reason) {}
}
