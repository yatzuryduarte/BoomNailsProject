
package com.boomnails.adapter.out.persistence;

import com.boomnails.domain.model.CreateProductCommand;
import com.boomnails.domain.model.Product;
import com.boomnails.domain.model.ProductPresentation;
import com.boomnails.domain.model.UpdateProductCommand;
import com.boomnails.domain.port.out.ProductRepositoryPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.Statement;
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
                pp.unidades_paquete,
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
                pp.unidades_paquete,
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

    // =========================================================
    // CONSULTAS ADMINISTRATIVAS
    // =========================================================

    @Override
    public List<Product> findAll() {
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
                pp.unidades_paquete,
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
            LEFT JOIN presentacion_producto pp
                ON pp.id_producto = p.id_producto
            LEFT JOIN categoria c
                ON c.id_categoria = p.id_categoria
            ORDER BY p.id_producto, pp.id_presentacion
            """;

        return mapProducts(sql);
    }

    @Override
    public Optional<Product> findByIdForAdmin(Long id) {
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
                pp.unidades_paquete,
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
            LEFT JOIN presentacion_producto pp
                ON pp.id_producto = p.id_producto
            LEFT JOIN categoria c
                ON c.id_categoria = p.id_categoria
            WHERE p.id_producto = ?
            ORDER BY p.id_producto, pp.id_presentacion
            """;

        List<Product> products = mapProducts(sql, id);
        return products.stream().findFirst();
    }

    // =========================================================
    // VALIDACIONES
    // =========================================================

    @Override
    public boolean existsByReference(String reference) {
        String sql = """
            SELECT COUNT(*)
            FROM producto
            WHERE referencia = ?
            """;

        Integer count = jdbcTemplate.queryForObject(
            sql,
            Integer.class,
            reference
        );

        return count != null && count > 0;
    }

    @Override
    public boolean existsByReferenceExcludingId(
            String reference,
            Long productId) {

        String sql = """
            SELECT COUNT(*)
            FROM producto
            WHERE referencia = ?
              AND id_producto <> ?
            """;

        Integer count = jdbcTemplate.queryForObject(
            sql,
            Integer.class,
            reference,
            productId
        );

        return count != null && count > 0;
    }

    // =========================================================
    // CREAR PRODUCTO
    // =========================================================

    @Override
    @Transactional
    public Long save(CreateProductCommand command) {

        String productSql = """
                INSERT INTO producto (
                    id_categoria,
                    referencia,
                    nombre,
                    descripcion
                )
                VALUES (?, ?, ?, ?)
                """;

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    productSql,
                    Statement.RETURN_GENERATED_KEYS
            );

            ps.setLong(1, command.categoryId());
            ps.setString(2, command.reference().trim());
            ps.setString(3, command.name().trim());
            ps.setString(
                    4,
                    command.description() == null
                            ? null
                            : command.description().trim()
            );

            return ps;
        }, keyHolder);

        Number generatedId = keyHolder.getKey();

        if (generatedId == null) {
            throw new IllegalStateException(
                    "No fue posible obtener el ID del producto creado"
            );
        }

        Long productId = generatedId.longValue();

        String presentationSql = """
                INSERT INTO presentacion_producto (
                    id_producto,
                    etiqueta,
                    volumen_ml,
                    unidades_paquete,
                    precio_detal,
                    precio_mayorista
                )
                VALUES (?, ?, ?, ?, ?, ?)
                """;

        for (CreateProductCommand.PresentationCommand presentation
                : command.presentations()) {

            jdbcTemplate.update(
                    presentationSql,
                    productId,
                    presentation.name().trim(),
                    presentation.volumeMl(),
                    presentation.unitsPerPackage(),
                    presentation.retailPrice(),
                    presentation.wholesalePrice()
            );
        }

        return productId;
    }

    // =========================================================
    // ACTUALIZAR PRODUCTO
    // =========================================================

    @Override
    @Transactional
    public void update(UpdateProductCommand command) {

        String productSql = """
            UPDATE producto
            SET id_categoria = ?,
                referencia = ?,
                nombre = ?,
                descripcion = ?
            WHERE id_producto = ?
            """;

        jdbcTemplate.update(
                productSql,
                command.categoryId(),
                command.reference().trim(),
                command.name().trim(),
                command.description(),
                command.id()
        );

        String updatePresentationSql = """
            UPDATE presentacion_producto
            SET etiqueta = ?,
                volumen_ml = ?,
                unidades_paquete = ?,
                precio_detal = ?,
                precio_mayorista = ?
            WHERE id_presentacion = ?
            AND id_producto = ?
            """;

        String insertPresentationSql = """
            INSERT INTO presentacion_producto (
                id_producto,
                etiqueta,
                volumen_ml,
                unidades_paquete,
                precio_detal,
                precio_mayorista
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """;

        for (UpdateProductCommand.PresentationCommand presentation
                : command.presentations()) {

            if (presentation.id() != null) {

                int updatedRows = jdbcTemplate.update(
                        updatePresentationSql,
                        presentation.name().trim(),
                        presentation.volumeMl(),
                        presentation.unitsPerPackage(),
                        presentation.retailPrice(),
                        presentation.wholesalePrice(),
                        presentation.id(),
                        command.id()
                );

                if (updatedRows == 0) {
                    throw new IllegalArgumentException(
                            "La presentación " + presentation.id()
                                    + " no pertenece al producto " + command.id()
                    );
                }

            } else {

                jdbcTemplate.update(
                        insertPresentationSql,
                        command.id(),
                        presentation.name().trim(),
                        presentation.volumeMl(),
                        presentation.unitsPerPackage(),
                        presentation.retailPrice(),
                        presentation.wholesalePrice()
                );
            }
        }
    }

    // =========================================================
    // ACTIVAR / DESACTIVAR
    // =========================================================

    @Override
    public void updateStatus(Long productId, boolean active) {

        String sql = """
            UPDATE producto
            SET estado = ?
            WHERE id_producto = ?
            """;

        jdbcTemplate.update(
            sql,
            active ? "ACTIVO" : "INACTIVO",
            productId
        );
    }

    // =========================================================
    // ELIMINAR
    // =========================================================

    @Override
    public void deleteById(Long productId) {

        String sql = """
            DELETE FROM producto
            WHERE id_producto = ?
            """;

        jdbcTemplate.update(sql, productId);
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

            Number presentationId =
                    (Number) row.get("id_presentacion");

            // Producto puede no tener presentaciones todavía.
            if (presentationId == null) {
                continue;
            }

            
            Number volume = (Number) row.get("volumen_ml");
            Number unitsPerPackage = (Number) row.get("unidades_paquete");
            Number stock = (Number) row.get("stock");

            BigDecimal retailPrice = (BigDecimal) row.get("precio_detal");
            BigDecimal wholesalePrice = (BigDecimal) row.get("precio_mayorista");

            builder.presentations.add(new ProductPresentation(
                presentationId.longValue(),
                productId,
                (String) row.get("etiqueta"),
                volume == null ? null : volume.intValue(),
                unitsPerPackage == null ? null : unitsPerPackage.intValue(),
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
