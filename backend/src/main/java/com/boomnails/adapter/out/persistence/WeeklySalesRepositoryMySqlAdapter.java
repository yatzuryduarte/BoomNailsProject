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
                DATE(pago.fecha_confirmacion) AS fecha_venta,
                SUM(pago.importe) AS total_ventas
            FROM pago
            INNER JOIN pedido
                ON pago.id_pedido = pedido.id_pedido
            WHERE pago.estado = 'APROBADO'
              AND pedido.estado IN (
                  'PEDIDO_CONFIRMADO',
                  'EN_BODEGA',
                  'EMPACADO',
                  'DESPACHADO',
                  'ENTREGADO'
              )
              AND pago.fecha_confirmacion >= CURDATE() - INTERVAL 6 DAY
              AND pago.fecha_confirmacion < CURDATE() + INTERVAL 1 DAY
            GROUP BY DATE(pago.fecha_confirmacion)
            ORDER BY fecha_venta
            """,
            (rs, rowNum) -> new WeeklySale(
                rs.getDate("fecha_venta").toLocalDate(),
                rs.getBigDecimal("total_ventas")
            )
        );
    }
}