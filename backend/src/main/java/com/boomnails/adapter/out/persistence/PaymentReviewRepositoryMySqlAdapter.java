package com.boomnails.adapter.out.persistence;

import com.boomnails.domain.port.out.PaymentReviewRepositoryPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class PaymentReviewRepositoryMySqlAdapter
        implements PaymentReviewRepositoryPort {

    private final JdbcTemplate jdbcTemplate;

    public PaymentReviewRepositoryMySqlAdapter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // =========================================================
    // APROBAR PAGO
    // =========================================================

    @Override
    @Transactional
    public void approvePayment(Long paymentId, Long adminUserId) {

        // -----------------------------------------------------
        // 1. Validar parámetros
        // -----------------------------------------------------

        if (paymentId == null || adminUserId == null) {
            throw new IllegalArgumentException(
                    "El pago y el administrador son obligatorios."
            );
        }

        // -----------------------------------------------------
        // 2. Buscar pago, pedido y comprobante
        //    FOR UPDATE bloquea el registro durante la transacción
        // -----------------------------------------------------

        var payments = jdbcTemplate.queryForList("""
            SELECT
                p.id_pago,
                p.id_pedido,
                pe.estado AS estado_pedido,
                p.estado AS estado_pago,
                cp.id_comprobante,
                cp.estado_revision
            FROM pago p
            JOIN pedido pe
                ON pe.id_pedido = p.id_pedido
            JOIN comprobante_pago cp
                ON cp.id_pago = p.id_pago
            WHERE p.id_pago = ?
            FOR UPDATE
            """, paymentId);

        if (payments.isEmpty()) {
            throw new IllegalArgumentException(
                    "No se encontró el pago o su comprobante."
            );
        }

        var payment = payments.get(0);

        // -----------------------------------------------------
        // 3. Validar que pago, comprobante y pedido
        //    estén en estado correcto
        // -----------------------------------------------------

        if (!"PENDIENTE".equals(payment.get("estado_pago"))
                || !"PENDIENTE".equals(payment.get("estado_revision"))
                || !"PAGO_EN_REVISION".equals(
                        payment.get("estado_pedido"))) {

            throw new IllegalStateException(
                    "El pago ya fue revisado o el pedido no está pendiente."
            );
        }

        Long orderId =
                ((Number) payment.get("id_pedido")).longValue();

        Long receiptId =
                ((Number) payment.get("id_comprobante")).longValue();

        // -----------------------------------------------------
        // 4. Obtener productos del pedido
        // -----------------------------------------------------

        var details = jdbcTemplate.queryForList("""
            SELECT
                id_presentacion,
                cantidad
            FROM detalle_pedido
            WHERE id_pedido = ?
            ORDER BY id_presentacion
            """, orderId);

        if (details.isEmpty()) {
            throw new IllegalStateException(
                    "El pedido no tiene productos para descontar."
            );
        }

        // -----------------------------------------------------
        // 5. Validar y descontar inventario
        // -----------------------------------------------------

        for (var detail : details) {

            Long presentationId =
                    ((Number) detail.get("id_presentacion")).longValue();

            int quantity =
                    ((Number) detail.get("cantidad")).intValue();

            int updated = jdbcTemplate.update("""
                UPDATE presentacion_producto
                SET stock = stock - ?
                WHERE id_presentacion = ?
                  AND stock >= ?
                  AND estado = 'ACTIVA'
                """,
                quantity,
                presentationId,
                quantity
            );

            if (updated != 1) {
                throw new IllegalStateException(
                        "Stock insuficiente o presentación inactiva. "
                                + "Presentación: " + presentationId
                );
            }
        }

        // -----------------------------------------------------
        // 6. Aprobar pago
        // -----------------------------------------------------

        int paymentUpdated = jdbcTemplate.update("""
            UPDATE pago
            SET estado = 'APROBADO',
                revisado_por = ?,
                fecha_confirmacion = CURRENT_TIMESTAMP,
                observacion_revision = NULL
            WHERE id_pago = ?
              AND estado = 'PENDIENTE'
            """,
            adminUserId,
            paymentId
        );

        if (paymentUpdated != 1) {
            throw new IllegalStateException(
                    "No fue posible actualizar el estado del pago."
            );
        }

        // -----------------------------------------------------
        // 7. Aceptar comprobante
        // -----------------------------------------------------

        int receiptUpdated = jdbcTemplate.update("""
            UPDATE comprobante_pago
            SET estado_revision = 'ACEPTADO',
                revisado_por = ?,
                motivo_rechazo = NULL,
                fecha_revision = CURRENT_TIMESTAMP
            WHERE id_comprobante = ?
              AND estado_revision = 'PENDIENTE'
            """,
            adminUserId,
            receiptId
        );

        if (receiptUpdated != 1) {
            throw new IllegalStateException(
                    "No fue posible actualizar el comprobante."
            );
        }

        // -----------------------------------------------------
        // 8. Confirmar pedido
        // -----------------------------------------------------

        int orderUpdated = jdbcTemplate.update("""
            UPDATE pedido
            SET estado = 'PEDIDO_CONFIRMADO'
            WHERE id_pedido = ?
              AND estado = 'PAGO_EN_REVISION'
            """,
            orderId
        );

        if (orderUpdated != 1) {
            throw new IllegalStateException(
                    "No fue posible confirmar el pedido."
            );
        }
    }


    // =========================================================
    // RECHAZAR PAGO
    // =========================================================

    @Override
    @Transactional
    public void rejectPayment(
            Long paymentId,
            Long adminUserId,
            String reason
    ) {

        // -----------------------------------------------------
        // 1. Validar parámetros
        // -----------------------------------------------------

        if (paymentId == null || adminUserId == null) {
            throw new IllegalArgumentException(
                    "El pago y el administrador son obligatorios."
            );
        }

        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException(
                    "Debes indicar el motivo del rechazo."
            );
        }

        String rejectionReason = reason.trim();

        if (rejectionReason.length() > 500) {
            throw new IllegalArgumentException(
                    "El motivo no puede superar los 500 caracteres."
            );
        }

        // -----------------------------------------------------
        // 2. Buscar pago, pedido y comprobante
        // -----------------------------------------------------

        var payments = jdbcTemplate.queryForList("""
            SELECT
                p.id_pago,
                p.id_pedido,
                pe.estado AS estado_pedido,
                p.estado AS estado_pago,
                cp.id_comprobante,
                cp.estado_revision
            FROM pago p
            JOIN pedido pe
                ON pe.id_pedido = p.id_pedido
            JOIN comprobante_pago cp
                ON cp.id_pago = p.id_pago
            WHERE p.id_pago = ?
            FOR UPDATE
            """,
            paymentId
        );

        if (payments.isEmpty()) {
            throw new IllegalArgumentException(
                    "No se encontró el pago o su comprobante."
            );
        }

        var payment = payments.get(0);

        // -----------------------------------------------------
        // 3. Validar que todo esté pendiente
        // -----------------------------------------------------

        if (!"PENDIENTE".equals(payment.get("estado_pago"))
                || !"PENDIENTE".equals(payment.get("estado_revision"))
                || !"PAGO_EN_REVISION".equals(
                        payment.get("estado_pedido"))) {

            throw new IllegalStateException(
                    "El pago ya fue revisado o el pedido no está pendiente."
            );
        }

        Long orderId =
                ((Number) payment.get("id_pedido")).longValue();

        Long receiptId =
                ((Number) payment.get("id_comprobante")).longValue();

        // -----------------------------------------------------
        // 4. RECHAZAR PAGO
        // -----------------------------------------------------

        int paymentUpdated = jdbcTemplate.update("""
            UPDATE pago
            SET estado = 'RECHAZADO',
                revisado_por = ?,
                fecha_confirmacion = CURRENT_TIMESTAMP,
                observacion_revision = ?
            WHERE id_pago = ?
              AND estado = 'PENDIENTE'
            """,
            adminUserId,
            rejectionReason,
            paymentId
        );

        if (paymentUpdated != 1) {
            throw new IllegalStateException(
                    "No fue posible rechazar el pago."
            );
        }

        // -----------------------------------------------------
        // 5. RECHAZAR COMPROBANTE
        // -----------------------------------------------------

        int receiptUpdated = jdbcTemplate.update("""
            UPDATE comprobante_pago
            SET estado_revision = 'RECHAZADO',
                revisado_por = ?,
                motivo_rechazo = ?,
                fecha_revision = CURRENT_TIMESTAMP
            WHERE id_comprobante = ?
              AND estado_revision = 'PENDIENTE'
            """,
            adminUserId,
            rejectionReason,
            receiptId
        );

        if (receiptUpdated != 1) {
            throw new IllegalStateException(
                    "No fue posible rechazar el comprobante."
            );
        }

        // -----------------------------------------------------
        // 6. RECHAZAR PEDIDO
        // -----------------------------------------------------

        int orderUpdated = jdbcTemplate.update("""
            UPDATE pedido
            SET estado = 'RECHAZADO'
            WHERE id_pedido = ?
              AND estado = 'PAGO_EN_REVISION'
            """,
            orderId
        );

        if (orderUpdated != 1) {
            throw new IllegalStateException(
                    "No fue posible rechazar el pedido después "
                            + "de rechazar el pago."
            );
        }

        // -----------------------------------------------------
        // 7. NO SE DESCUENTA INVENTARIO
        //
        // Cuando el pago es rechazado, el stock permanece igual.
        // -----------------------------------------------------
    }
}