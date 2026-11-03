package com.boomnails.adapter.out.persistence;

import com.boomnails.domain.model.InventoryExit;
import com.boomnails.domain.port.out.InventoryExitRepositoryPort;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;

@Repository
public class InventoryExitRepositoryMySqlAdapter
        implements InventoryExitRepositoryPort {

    private final JdbcTemplate jdbcTemplate;

    public InventoryExitRepositoryMySqlAdapter(
            JdbcTemplate jdbcTemplate
    ) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long registerExit(
            InventoryExit exit,
            String authenticatedEmail
    ) {

        // 1. Identificar al administrador.
        Long userId = jdbcTemplate.queryForObject(
                """
                SELECT id_usuario
                FROM usuario
                WHERE correo = ?
                AND estado = 'ACTIVO'
                """,
                Long.class,
                authenticatedEmail
        );

        if (userId == null) {
            throw new IllegalArgumentException(
                    "No se encontró un usuario activo"
            );
        }

        // 2. Bloquear la presentación y consultar sus existencias.
        Map<String, Object> presentation = jdbcTemplate.queryForMap(
                """
                SELECT pp.stock, pp.costo_promedio, pp.estado
                FROM presentacion_producto pp
                WHERE pp.id_presentacion = ?
                FOR UPDATE
                """,
                exit.getPresentationId()
        );

        String status = (String) presentation.get("estado");

        if (!"ACTIVA".equalsIgnoreCase(status)) {
            throw new IllegalArgumentException(
                    "La presentación está inactiva"
            );
        }

        int previousStock =
                ((Number) presentation.get("stock")).intValue();

        BigDecimal averageCost =
                (BigDecimal) presentation.get("costo_promedio");

        // 3. Validar las existencias.
        if (exit.getQuantity() > previousStock) {
            throw new IllegalArgumentException(
                    "Stock insuficiente. Existencias disponibles: "
                            + previousStock
            );
        }

        int newStock = previousStock - exit.getQuantity();

        // 4. Descontar las unidades.
        jdbcTemplate.update(
                """
                UPDATE presentacion_producto
                SET stock = ?
                WHERE id_presentacion = ?
                """,
                newStock,
                exit.getPresentationId()
        );

        // 5. Registrar el movimiento de salida.
        jdbcTemplate.update(
                """
                INSERT INTO movimiento_inventario (
                    id_presentacion,
                    id_usuario,
                    tipo_movimiento,
                    cantidad,
                    stock_anterior,
                    stock_resultante,
                    motivo,
                    costo_unitario,
                    documento_referencia,
                    observaciones
                )
                VALUES (?, ?, 'SALIDA', ?, ?, ?, ?, ?, ?, ?)
                """,
                exit.getPresentationId(),
                userId,
                exit.getQuantity(),
                previousStock,
                newStock,
                exit.getReason(),
                averageCost,
                exit.getReference(),
                exit.getNotes()
        );

        return jdbcTemplate.queryForObject(
                "SELECT LAST_INSERT_ID()",
                Long.class
        );
    }
}