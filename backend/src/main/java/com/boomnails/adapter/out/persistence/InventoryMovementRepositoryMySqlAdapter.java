package com.boomnails.adapter.out.persistence;

import com.boomnails.domain.port.out.InventoryMovementRepositoryPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class InventoryMovementRepositoryMySqlAdapter
        implements InventoryMovementRepositoryPort {

    private final JdbcTemplate jdbcTemplate;

    public InventoryMovementRepositoryMySqlAdapter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<Map<String, Object>> findAllMovements() {

        String sql = """
            SELECT
                mi.id_movimiento AS idMovimiento,
                mi.tipo_movimiento AS tipoMovimiento,
                mi.cantidad AS cantidad,
                mi.stock_anterior AS stockAnterior,
                mi.stock_resultante AS stockResultante,
                mi.motivo AS motivo,
                mi.costo_unitario AS costoUnitario,
                mi.documento_referencia AS documentoReferencia,
                mi.observaciones AS observaciones,
                mi.fecha_movimiento AS fechaMovimiento,
                pp.id_presentacion AS idPresentacion,
                p.nombre AS producto,
                pp.etiqueta AS presentacion,
                u.correo AS usuario
            FROM movimiento_inventario mi
            INNER JOIN presentacion_producto pp
                ON mi.id_presentacion = pp.id_presentacion
            INNER JOIN producto p
                ON pp.id_producto = p.id_producto
            INNER JOIN usuario u
                ON mi.id_usuario = u.id_usuario
            ORDER BY mi.fecha_movimiento DESC, mi.id_movimiento DESC
            """;

        return jdbcTemplate.queryForList(sql);
    }
}
