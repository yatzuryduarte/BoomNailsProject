
package com.boomnails.adapter.out.persistence;

import com.boomnails.domain.model.Product;
import com.boomnails.domain.model.ProductPresentation;
import com.boomnails.domain.port.out.ProductRepositoryPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class ProductRepositoryMySqlAdapter implements ProductRepositoryPort {

    private final JdbcTemplate jdbcTemplate;

    public ProductRepositoryMySqlAdapter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<Product> findAllActive() {
        String sql = """
            SELECT
                p.id_producto,
                p.referencia,
                p.nombre,
                p.descripcion,
                p.id_categoria,
                p.estado AS estado_producto,
                pp.id_presentacion,
                pp.etiqueta,
                pp.volumen_ml,
                pp.precio_detal,
                pp.precio_mayorista,
                pp.stock,
                pp.estado AS estado_presentacion,
                (
                    SELECT ip.ruta_archivo
                    FROM imagen_producto ip
                    WHERE ip.id_producto = p.id_producto
                    ORDER BY ip.es_principal DESC, ip.orden_visual ASC
                    LIMIT 1
                ) AS imagen_url
            FROM producto p
INNER JOIN presentacion_producto pp
    ON pp.id_producto = p.id_producto

INNER JOIN categoria c
    ON c.id_categoria = p.id_categoria

LEFT JOIN categoria cp
    ON cp.id_categoria = c.id_categoria_padre

WHERE p.estado = 'ACTIVO'
  AND pp.estado = 'ACTIVA'
  AND c.estado = 'ACTIVA'
  AND (
      c.id_categoria_padre IS NULL
      OR cp.estado = 'ACTIVA'
  )

ORDER BY p.id_producto, pp.id_presentacion
            """;

        return mapProducts(sql);
    }

    @Override
    public Optional<Product> findById(Long id) {
        String sql = """
            SELECT
                p.id_producto,
                p.referencia,
                p.nombre,
                p.descripcion,
                p.id_categoria,
                p.estado AS estado_producto,
                pp.id_presentacion,
                pp.etiqueta,
                pp.volumen_ml,
                pp.precio_detal,
                pp.precio_mayorista,
                pp.stock,
                pp.estado AS estado_presentacion,
                (
                    SELECT ip.ruta_archivo
                    FROM imagen_producto ip
                    WHERE ip.id_producto = p.id_producto
                    ORDER BY ip.es_principal DESC, ip.orden_visual ASC
                    LIMIT 1
                ) AS imagen_url
            FROM producto p
            INNER JOIN presentacion_producto pp
                ON pp.id_producto = p.id_producto

            INNER JOIN categoria c
                ON c.id_categoria = p.id_categoria

            LEFT JOIN categoria cp
                ON cp.id_categoria = c.id_categoria_padre

            WHERE p.id_producto = ?
            AND p.estado = 'ACTIVO'
            AND pp.estado = 'ACTIVA'
            AND c.estado = 'ACTIVA'
            AND (
                c.id_categoria_padre IS NULL
                OR cp.estado = 'ACTIVA'
            )

            ORDER BY p.id_producto, pp.id_presentacion
            """;

        List<Product> products = mapProducts(sql, id);
        return products.stream().findFirst();
    }

    private List<Product> mapProducts(String sql, Object... args) {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, args);

        Map<Long, ProductBuilder> grouped = new LinkedHashMap<>();

        for (Map<String, Object> row : rows) {
            Long productId = ((Number) row.get("id_producto")).longValue();

            ProductBuilder builder = grouped.computeIfAbsent(
                productId,
                key -> new ProductBuilder(
                    productId,
                    (String) row.get("referencia"),
                    (String) row.get("nombre"),
                    (String) row.get("descripcion"),
                    ((Number) row.get("id_categoria")).longValue(),
                    "ACTIVO".equals(row.get("estado_producto")),
                    (String) row.get("imagen_url")
                )
            );

            Number presentationId = (Number) row.get("id_presentacion");
            Number volume = (Number) row.get("volumen_ml");
            Number stock = (Number) row.get("stock");

            BigDecimal retailPrice = (BigDecimal) row.get("precio_detal");
            BigDecimal wholesalePrice = (BigDecimal) row.get("precio_mayorista");

            builder.presentations.add(new ProductPresentation(
                presentationId.longValue(),
                productId,
                (String) row.get("etiqueta"),
                volume == null ? null : volume.toString() + " ml",
                retailPrice,
                wholesalePrice,
                stock == null ? 0 : stock.intValue(),
                "ACTIVA".equals(row.get("estado_presentacion"))
            ));
        }

        List<Product> products = new ArrayList<>();

        for (ProductBuilder builder : grouped.values()) {
            products.add(new Product(
                builder.id,
                builder.reference,
                builder.name,
                builder.description,
                builder.categoryId,
                builder.active,
                builder.presentations,
                builder.imageUrl
            ));
        }

        return products;
    }

    private static class ProductBuilder {
        private final Long id;
        private final String reference;
        private final String name;
        private final String description;
        private final Long categoryId;
        private final boolean active;
        private final String imageUrl;
        private final List<ProductPresentation> presentations = new ArrayList<>();

        private ProductBuilder(
                Long id,
                String reference,
                String name,
                String description,
                Long categoryId,
                boolean active,
                String imageUrl) {
            this.id = id;
            this.reference = reference;
            this.name = name;
            this.description = description;
            this.categoryId = categoryId;
            this.active = active;
            this.imageUrl = imageUrl;
        }
    }
}
