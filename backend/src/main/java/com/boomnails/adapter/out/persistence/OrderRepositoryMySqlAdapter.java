
package com.boomnails.adapter.out.persistence;

import com.boomnails.domain.model.Order;
import com.boomnails.domain.port.out.OrderRepositoryPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;
import java.util.Set;

@Repository
public class OrderRepositoryMySqlAdapter
        implements OrderRepositoryPort {

    private final JdbcTemplate jdbcTemplate;

    public OrderRepositoryMySqlAdapter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public Long save(Order order) {
        BigDecimal subtotal = BigDecimal.ZERO;
        Set<Long> presentationIds = new HashSet<>();
        List<OrderLine> lines = new ArrayList<>();

        for (Order.OrderItem item : order.items()) {
                if (!presentationIds.add(item.presentationId())) {
                throw new IllegalArgumentException(
                        "El pedido contiene una presentación duplicada.");
            }
            
                if (item == null
                    || item.presentationId() == null
                    || item.presentationId() <= 0) {
                throw new IllegalArgumentException(
                        "La presentación del producto no es válida.");
            }

                if (item.quantity() <= 0) {
                    throw new IllegalArgumentException(
                            "La cantidad de cada producto debe ser mayor que cero.");
                }
            List<OrderLine> results = jdbcTemplate.query("""
                SELECT
                    p.referencia,
                    p.nombre,
                    pp.etiqueta,
                    pp.volumen_ml,
                    pp.precio_detal,
                    pp.stock
                FROM presentacion_producto pp
                JOIN producto p ON p.id_producto = pp.id_producto
                WHERE pp.id_presentacion = ?
                  AND pp.estado = 'ACTIVA'
                  AND p.estado = 'ACTIVO'
                """,
                (rs, rowNum) -> {
                    BigDecimal price = rs.getBigDecimal("precio_detal");
                    int stock = rs.getInt("stock");

                    if (price == null || price.signum() < 0) {
                        throw new IllegalArgumentException(
                                "La presentación no tiene un precio al detal válido.");
                    }

                    if (stock < item.quantity()) {
                        throw new IllegalArgumentException(
                                "No hay existencias suficientes para: "
                                        + rs.getString("nombre"));
                    }

                    String label = rs.getString("etiqueta");
                    BigDecimal volume = rs.getBigDecimal("volumen_ml");

                    String presentation = label;
                    if (volume != null) {
                        presentation += " - " + volume.stripTrailingZeros().toPlainString() + " ml";
                    }

                    return new OrderLine(
                            rs.getString("referencia"),
                            rs.getString("nombre"),
                            presentation,
                            price,
                            item.quantity()
                    );
                },
                item.presentationId()
            );

            if (results.isEmpty()) {
                throw new IllegalArgumentException(
                        "Una presentación no existe o está inactiva.");
            }

            OrderLine line = results.get(0);
            lines.add(line);

            BigDecimal lineSubtotal = line.price()
                    .multiply(BigDecimal.valueOf(line.quantity()));

            subtotal = subtotal.add(lineSubtotal);
        }

        String orderNumber = "BN-" + UUID.randomUUID()
                .toString().substring(0, 8).toUpperCase();

        
String sql = """
    INSERT INTO pedido (
        numero_pedido,
        id_cliente,
        estado,
        nombre_entrega,
        correo_entrega,
        telefono_entrega,
        direccion_entrega,
        ciudad_entrega,
        departamento_entrega,
        pais_entrega,
        nota_entrega,
        subtotal,
        costo_envio,
        descuento,
        total
    )
    VALUES (?, ?, 'PAGO_EN_REVISION', ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)
    """;

org.springframework.jdbc.support.GeneratedKeyHolder keyHolder =
        new org.springframework.jdbc.support.GeneratedKeyHolder();

        BigDecimal orderSubtotal = subtotal;
    jdbcTemplate.update(connection -> {
    java.sql.PreparedStatement statement = connection.prepareStatement(
            sql,
            java.sql.Statement.RETURN_GENERATED_KEYS
    );

    statement.setString(1, orderNumber);

    if (order.customerId() == null) {
        statement.setNull(2, java.sql.Types.BIGINT);
    } else {
        statement.setLong(2, order.customerId());
    }

    statement.setString(3, order.customerName());
    statement.setString(4, order.customerEmail());
    statement.setString(5, order.customerPhone());
    statement.setString(6, order.shippingAddress());
    statement.setString(7, order.shippingCity());
    statement.setString(8, order.shippingDepartment());

    String country = order.shippingCountry() == null
            || order.shippingCountry().isBlank()
            ? "Colombia"
            : order.shippingCountry();

    statement.setString(9, country);
    statement.setString(10, order.deliveryNote());
    statement.setBigDecimal(11, orderSubtotal);
    statement.setBigDecimal(12, orderSubtotal);

    return statement;
}, keyHolder);

Number generatedKey = keyHolder.getKey();

if (generatedKey == null) {
    throw new IllegalStateException(
            "No fue posible obtener el identificador del pedido."
    );
}

Long orderId = generatedKey.longValue();


        for (int i = 0; i < lines.size(); i++) {
            OrderLine line = lines.get(i);
            Order.OrderItem item = order.items().get(i);

            BigDecimal lineSubtotal = line.price()
                    .multiply(BigDecimal.valueOf(line.quantity()));

            jdbcTemplate.update("""
                INSERT INTO detalle_pedido (
                    id_pedido,
                    id_presentacion,
                    referencia_snapshot,
                    nombre_snapshot,
                    presentacion_snapshot,
                    cantidad,
                    precio_unitario,
                    subtotal
                )
                SELECT ?, pp.id_presentacion, ?, ?, ?, ?, ?, ?
                FROM presentacion_producto pp
                WHERE pp.id_presentacion = ?
                """,
                orderId,
                line.reference(),
                line.name(),
                line.presentation(),
                line.quantity(),
                line.price(),
                lineSubtotal,
                item.presentationId()
            );
        }

        return orderId;
    }

    private record OrderLine(
            String reference,
            String name,
            String presentation,
            BigDecimal price,
            int quantity
    ) {}
}

