
package com.boomnails.adapter.out.persistence;

import com.boomnails.domain.port.out.OrderTotalRepositoryPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public class OrderTotalRepositoryMySqlAdapter
        implements OrderTotalRepositoryPort {

    private final JdbcTemplate jdbcTemplate;

    public OrderTotalRepositoryMySqlAdapter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public BigDecimal findTotalByOrderId(Long orderId) {
        if (orderId == null || orderId <= 0) {
            throw new IllegalArgumentException(
                    "El identificador del pedido no es válido.");
        }

        return jdbcTemplate.queryForObject("""
            SELECT total
            FROM pedido
            WHERE id_pedido = ?
            """,
            BigDecimal.class,
            orderId
        );
    }
}
