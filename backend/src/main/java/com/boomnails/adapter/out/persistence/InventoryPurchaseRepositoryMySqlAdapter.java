package com.boomnails.adapter.out.persistence;

import com.boomnails.domain.model.InventoryPurchase;
import com.boomnails.domain.model.InventoryPurchaseLine;
import com.boomnails.domain.port.out.InventoryPurchaseRepositoryPort;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.Map;

@Repository
public class InventoryPurchaseRepositoryMySqlAdapter
        implements InventoryPurchaseRepositoryPort {

    private final JdbcTemplate jdbcTemplate;

    public InventoryPurchaseRepositoryMySqlAdapter(
            JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long registerPurchase(
            InventoryPurchase purchase,
            String authenticatedEmail) {

        // 1. Verificar que el proveedor exista y esté activo.
        Integer supplierCount = jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM proveedor
                WHERE id_proveedor = ?
                AND estado = 'ACTIVO'
                """,
                Integer.class,
                purchase.getSupplierId()
        );

        if (supplierCount == null || supplierCount == 0) {
            throw new IllegalArgumentException(
                    "El proveedor no existe o está inactivo"
            );
        }

        // 2. Identificar al administrador mediante su correo autenticado.
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
                    "No se encontró un usuario activo para registrar la compra"
            );
        }

        // 3. Crear el encabezado de la compra.
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(
                    """
                    INSERT INTO compra_inventario (
                        id_proveedor,
                        id_usuario,
                        numero_factura,
                        fecha_compra,
                        subtotal,
                        observaciones
                    )
                    VALUES (?, ?, ?, ?, 0.00, ?)
                    """,
                    Statement.RETURN_GENERATED_KEYS
            );

            statement.setLong(1, purchase.getSupplierId());
            statement.setLong(2, userId);
            statement.setString(3, purchase.getInvoiceNumber());
            statement.setTimestamp(
                    4,
                    Timestamp.valueOf(purchase.getPurchaseDate())
            );
            statement.setString(5, purchase.getNotes());

            return statement;
        }, keyHolder);

        if (keyHolder.getKey() == null) {
            throw new IllegalStateException(
                    "No se pudo generar el número de la compra"
            );
        }

        Long purchaseId = keyHolder.getKey().longValue();
        BigDecimal purchaseSubtotal = BigDecimal.ZERO;

        // 4. Procesar cada presentación comprada.
        for (InventoryPurchaseLine line : purchase.getLines()) {

            // Bloquear la fila para evitar actualizaciones simultáneas.
            Map<String, Object> presentation = jdbcTemplate.queryForMap(
                    """
                    SELECT stock, costo_promedio
                    FROM presentacion_producto
                    WHERE id_presentacion = ?
                    FOR UPDATE
                    """,
                    line.getPresentationId()
            );

            int previousStock =
                    ((Number) presentation.get("stock")).intValue();

            BigDecimal previousAverageCost =
                    (BigDecimal) presentation.get("costo_promedio");

            int newStock = previousStock + line.getQuantity();

            // 5. Calcular el costo promedio ponderado.
            BigDecimal previousInventoryValue =
                    previousAverageCost.multiply(
                            BigDecimal.valueOf(previousStock)
                    );

            BigDecimal incomingInventoryValue =
                    line.getUnitCost().multiply(
                            BigDecimal.valueOf(line.getQuantity())
                    );

            BigDecimal newAverageCost =
                    previousInventoryValue
                            .add(incomingInventoryValue)
                            .divide(
                                    BigDecimal.valueOf(newStock),
                                    2,
                                    RoundingMode.HALF_UP
                            );

            // 6. Actualizar stock y costo promedio.
            jdbcTemplate.update(
                    """
                    UPDATE presentacion_producto
                    SET stock = ?,
                        costo_promedio = ?
                    WHERE id_presentacion = ?
                    """,
                    newStock,
                    newAverageCost,
                    line.getPresentationId()
            );

            // 7. Registrar el detalle de la compra.
            BigDecimal lineSubtotal = line.getSubtotal();

            jdbcTemplate.update(
                    """
                    INSERT INTO detalle_compra_inventario (
                        id_compra,
                        id_presentacion,
                        cantidad,
                        costo_unitario,
                        subtotal,
                        observaciones
                    )
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    purchaseId,
                    line.getPresentationId(),
                    line.getQuantity(),
                    line.getUnitCost(),
                    lineSubtotal,
                    line.getNotes()
            );

            // 8. Registrar el movimiento de entrada.
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
                    VALUES (?, ?, 'ENTRADA', ?, ?, ?, 'COMPRA', ?, ?, ?)
                    """,
                    line.getPresentationId(),
                    userId,
                    line.getQuantity(),
                    previousStock,
                    newStock,
                    line.getUnitCost(),
                    purchase.getInvoiceNumber(),
                    line.getNotes()
            );

            purchaseSubtotal = purchaseSubtotal.add(lineSubtotal);
        }

        // 9. Actualizar el subtotal de la compra.
        jdbcTemplate.update(
                """
                UPDATE compra_inventario
                SET subtotal = ?
                WHERE id_compra = ?
                """,
                purchaseSubtotal,
                purchaseId
        );

        return purchaseId;
    }
}