package com.boomnails.adapter.out.persistence;

import com.boomnails.domain.model.AdminOrder;
import com.boomnails.domain.model.AdminOrderItem;
import com.boomnails.domain.port.out.AdminOrderRepositoryPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.List;

@Repository
public class AdminOrderRepositoryMySqlAdapter implements AdminOrderRepositoryPort {

    private final JdbcTemplate jdbcTemplate;

    public AdminOrderRepositoryMySqlAdapter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<AdminOrder> findAllOrders() {
        return jdbcTemplate.query("""
            SELECT
                id_pedido,
                numero_pedido,
                estado,
                nombre_entrega,
                correo_entrega,
                telefono_entrega,
                direccion_entrega,
                ciudad_entrega,
                departamento_entrega,
                pais_entrega,
                total,
                transportadora,
                numero_guia,
                fecha_creacion,
                fecha_despacho
            FROM pedido
            ORDER BY fecha_creacion DESC
            """,
            (rs, rowNum) -> {
                Timestamp createdAt = rs.getTimestamp("fecha_creacion");
                Timestamp dispatchedAt = rs.getTimestamp("fecha_despacho");

                return new AdminOrder(
                    rs.getLong("id_pedido"),
                    rs.getString("numero_pedido"),
                    rs.getString("estado"),
                    rs.getString("nombre_entrega"),
                    rs.getString("correo_entrega"),
                    rs.getString("telefono_entrega"),
                    rs.getString("direccion_entrega"),
                    rs.getString("ciudad_entrega"),
                    rs.getString("departamento_entrega"),
                    rs.getString("pais_entrega"),
                    rs.getBigDecimal("total"),
                    rs.getString("transportadora"),
                    rs.getString("numero_guia"),
                    createdAt != null ? createdAt.toLocalDateTime() : null,
                    dispatchedAt != null ? dispatchedAt.toLocalDateTime() : null
                );
            }
        );
    }

    @Override
    public List<AdminOrderItem> findItemsByOrderId(Long orderId) {
        return jdbcTemplate.query("""
            SELECT
                id_detalle_pedido,
                id_presentacion,
                referencia_snapshot,
                nombre_snapshot,
                presentacion_snapshot,
                cantidad,
                precio_unitario,
                subtotal
            FROM detalle_pedido
            WHERE id_pedido = ?
            ORDER BY id_detalle_pedido ASC
            """,
            (rs, rowNum) -> new AdminOrderItem(
                rs.getLong("id_detalle_pedido"),
                rs.getLong("id_presentacion"),
                rs.getString("referencia_snapshot"),
                rs.getString("nombre_snapshot"),
                rs.getString("presentacion_snapshot"),
                rs.getInt("cantidad"),
                rs.getBigDecimal("precio_unitario"),
                rs.getBigDecimal("subtotal")
            ),
            orderId
        );
    }

    @Override
    @Transactional
    public void updateOrderStatus(
            Long orderId,
            String status,
            String carrier,
            String trackingNumber
    ) {
        // Consultar y bloquear el pedido durante la actualización
        String currentStatus = jdbcTemplate.queryForObject(
            """
            SELECT estado
            FROM pedido
            WHERE id_pedido = ?
            FOR UPDATE
            """,
            String.class,
            orderId
        );

        if (currentStatus == null) {
            throw new IllegalArgumentException("El pedido no tiene un estado registrado.");
        }

        // Validar la secuencia permitida
        boolean validTransition = switch (currentStatus) {
            case "PEDIDO_CONFIRMADO" -> status.equals("EN_BODEGA");
            case "EN_BODEGA" -> status.equals("EMPACADO");
            case "EMPACADO" -> status.equals("DESPACHADO");
            case "DESPACHADO" -> status.equals("ENTREGADO");
            default -> false;
        };

        if (!validTransition) {
            throw new IllegalArgumentException(
                "No se permite cambiar el pedido de "
                + currentStatus + " a " + status
            );
        }

        // Para despachar se necesita transportadora y guía
        if ("DESPACHADO".equals(status)) {
            if (carrier == null || carrier.isBlank()) {
                throw new IllegalArgumentException(
                    "Debes registrar la transportadora."
                );
            }

            if (trackingNumber == null || trackingNumber.isBlank()) {
                throw new IllegalArgumentException(
                    "Debes registrar el número de guía."
                );
            }
        }

        jdbcTemplate.update(
            """
            UPDATE pedido
            SET estado = ?,
                transportadora = COALESCE(?, transportadora),
                numero_guia = COALESCE(?, numero_guia),
                fecha_despacho = CASE
                    WHEN ? = 'DESPACHADO' THEN CURRENT_TIMESTAMP
                    ELSE fecha_despacho
                END,
                fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id_pedido = ?
            """,
            status,
            carrier != null && !carrier.isBlank() ? carrier.trim() : null,
            trackingNumber != null && !trackingNumber.isBlank()
                ? trackingNumber.trim() : null,
            status,
            orderId
        );
    }
}