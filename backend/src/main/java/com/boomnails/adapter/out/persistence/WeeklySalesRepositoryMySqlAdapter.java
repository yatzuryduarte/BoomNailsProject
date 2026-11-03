
package com.boomnails.adapter.out.persistence;

import com.boomnails.domain.model.WeeklySale;
import com.boomnails.domain.port.out.WeeklySalesRepositoryPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class WeeklySalesRepositoryMySqlAdapter
        implements WeeklySalesRepositoryPort {

    private final JdbcTemplate jdbcTemplate;

    public WeeklySalesRepositoryMySqlAdapter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<WeeklySale> findWeeklySales() {
        return jdbcTemplate.query(
            """
            SELECT
                DATE(fecha_confirmacion) AS fecha_venta,
                SUM(importe) AS total_ventas
            FROM pago
            WHERE estado = 'APROBADO'
              AND fecha_confirmacion >= CURDATE() - INTERVAL 6 DAY
              AND fecha_confirmacion < CURDATE() + INTERVAL 1 DAY
            GROUP BY DATE(fecha_confirmacion)
            ORDER BY fecha_venta
            """,
            (rs, rowNum) -> new WeeklySale(
                rs.getDate("fecha_venta").toLocalDate(),
                rs.getBigDecimal("total_ventas")
            )
        );
    }
}
