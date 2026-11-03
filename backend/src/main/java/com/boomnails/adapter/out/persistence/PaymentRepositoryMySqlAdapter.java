
package com.boomnails.adapter.out.persistence;

import com.boomnails.domain.port.out.PaymentRepositoryPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.Statement;

@Repository
public class PaymentRepositoryMySqlAdapter
        implements PaymentRepositoryPort {

    private final JdbcTemplate jdbcTemplate;

    public PaymentRepositoryMySqlAdapter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public Long savePendingTransfer(Long orderId, BigDecimal amount) {
        if (orderId == null || orderId <= 0) {
            throw new IllegalArgumentException(
                    "El identificador del pedido no es válido.");
        }

        if (amount == null || amount.signum() <= 0) {
            throw new IllegalArgumentException(
                    "El importe del pago debe ser mayor que cero.");
        }

        String sql = """
            INSERT INTO pago (
                id_pedido,
                metodo,
                importe,
                estado
            )
            VALUES (?, 'TRANSFERENCIA', ?, 'PENDIENTE')
            """;

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update((Connection connection) -> {
            PreparedStatement statement = connection.prepareStatement(
                    sql, Statement.RETURN_GENERATED_KEYS);
            statement.setLong(1, orderId);
            statement.setBigDecimal(2, amount);
            return statement;
        }, keyHolder);

        Number generatedKey = keyHolder.getKey();

        if (generatedKey == null) {
            throw new IllegalStateException(
                    "No fue posible recuperar el identificador del pago.");
        }

        return generatedKey.longValue();
    }

        @Override
    public boolean belongsToOrder(Long paymentId, Long orderId) {
        if (paymentId == null || paymentId <= 0
                || orderId == null || orderId <= 0) {
            return false;
        }

        String sql = """
            SELECT COUNT(*)
            FROM pago
            WHERE id_pago = ?
            AND id_pedido = ?
            AND estado = 'PENDIENTE'
            """;

        Integer count = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                paymentId,
                orderId
        );

        return count != null && count > 0;
    }
}

