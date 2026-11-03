package com.boomnails.adapter.out.persistence;

import com.boomnails.domain.model.InventoryItem;
import com.boomnails.domain.port.out.InventoryRepositoryPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class InventoryRepositoryMySqlAdapter implements InventoryRepositoryPort {

    private final JdbcTemplate jdbcTemplate;

    public InventoryRepositoryMySqlAdapter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private static final String BASE_QUERY = """
        SELECT
            pp.id_presentacion,
            p.id_producto,
            p.referencia,
            p.nombre AS nombre_producto,
            p.estado AS estado_producto,
            c.id_categoria,
            c.nombre AS nombre_categoria,
            pp.etiqueta,
            pp.volumen_ml,
            pp.costo_promedio,
            pp.precio_detal,
            pp.precio_mayorista,
            pp.stock,
            pp.stock_minimo,
            pp.estado AS estado_presentacion,
            (
                SELECT ip.ruta_archivo
                FROM imagen_producto ip
                WHERE ip.id_producto = p.id_producto
                ORDER BY ip.es_principal DESC, ip.orden_visual ASC
                LIMIT 1
            ) AS imagen_url
        FROM presentacion_producto pp
        INNER JOIN producto p
            ON p.id_producto = pp.id_producto
        LEFT JOIN categoria c
            ON c.id_categoria = p.id_categoria
        """;

    @Override
    public List<InventoryItem> findAll() {
        String sql = BASE_QUERY + """
            ORDER BY p.nombre ASC, pp.id_presentacion ASC
            """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> mapInventoryItem(rs));
    }

    @Override
    public Optional<InventoryItem> findByPresentationId(Long presentationId) {
        String sql = BASE_QUERY + """
            WHERE pp.id_presentacion = ?
            """;

        List<InventoryItem> results = jdbcTemplate.query(
            sql,
            (rs, rowNum) -> mapInventoryItem(rs),
            presentationId
        );

        return results.stream().findFirst();
    }

    @Override
    public List<InventoryItem> search(
            Long productId,
            String searchTerm,
            Long categoryId
    ) {
        StringBuilder sql = new StringBuilder(BASE_QUERY);
        sql.append(" WHERE 1 = 1 ");

        List<Object> parameters = new ArrayList<>();

        if (productId != null) {
            sql.append(" AND p.id_producto = ? ");
            parameters.add(productId);
        }

        if (categoryId != null) {
            sql.append("""
                AND (
                    c.id_categoria = ?
                    OR c.id_categoria_padre = ?
                )
                """);
            parameters.add(categoryId);
            parameters.add(categoryId);
        }

        if (searchTerm != null && !searchTerm.isBlank()) {
            sql.append("""
                AND (
                    p.nombre LIKE ?
                    OR p.referencia LIKE ?
                    OR c.nombre LIKE ?
                    OR CAST(p.id_producto AS CHAR) LIKE ?
                    OR CAST(pp.id_presentacion AS CHAR) LIKE ?
                )
                """);

            String term = "%" + searchTerm.trim() + "%";

            parameters.add(term);
            parameters.add(term);
            parameters.add(term);
            parameters.add(term);
            parameters.add(term);
        }

        sql.append(" ORDER BY p.nombre ASC, pp.id_presentacion ASC ");

        return jdbcTemplate.query(
            sql.toString(),
            (rs, rowNum) -> mapInventoryItem(rs),
            parameters.toArray()
        );
    }

    private InventoryItem mapInventoryItem(
            java.sql.ResultSet rs
    ) throws java.sql.SQLException {

        BigDecimal volume = rs.getBigDecimal("volumen_ml");

        String size = volume == null
            ? null
            : volume.stripTrailingZeros().toPlainString() + " ml";

        return new InventoryItem(
            rs.getLong("id_presentacion"),
            rs.getLong("id_producto"),
            rs.getString("referencia"),
            rs.getString("nombre_producto"),
            rs.getObject("id_categoria") == null
                ? null
                : rs.getLong("id_categoria"),
            rs.getString("nombre_categoria"),
            rs.getString("etiqueta"),
            size,
            rs.getString("imagen_url"),
            rs.getBigDecimal("costo_promedio"),
            rs.getBigDecimal("precio_detal"),
            rs.getBigDecimal("precio_mayorista"),
            rs.getInt("stock"),
            rs.getInt("stock_minimo"),
            "ACTIVO".equalsIgnoreCase(
                rs.getString("estado_producto")
            ),
            "ACTIVA".equalsIgnoreCase(
                rs.getString("estado_presentacion")
            )
        );
    }
}
