package com.boomnails.adapter.out.persistence;

import com.boomnails.domain.model.TopSellingProduct;
import com.boomnails.domain.port.out.TopSellingProductRepositoryPort;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class TopSellingProductRepositoryMySqlAdapter
        implements TopSellingProductRepositoryPort {

    private final JdbcTemplate jdbcTemplate;

    public TopSellingProductRepositoryMySqlAdapter(
            JdbcTemplate jdbcTemplate
    ) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<TopSellingProduct> findTopSellingProducts() {

        return jdbcTemplate.query(
            """
            SELECT
                dp.nombre_snapshot AS producto,
                SUM(dp.cantidad) AS unidades_vendidas
            FROM detalle_pedido dp
            INNER JOIN pedido p
                ON dp.id_pedido = p.id_pedido
            WHERE p.estado NOT IN (
                'CANCELADO',
                'PAGO_EN_REVISION'
            )
            GROUP BY dp.nombre_snapshot
            ORDER BY unidades_vendidas DESC
            LIMIT 5
            """,
            (rs, rowNum) -> new TopSellingProduct(
                rs.getString("producto"),
                rs.getLong("unidades_vendidas")
            )
        );
    }
}