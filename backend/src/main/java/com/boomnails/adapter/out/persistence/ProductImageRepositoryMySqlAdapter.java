
package com.boomnails.adapter.out.persistence;

import com.boomnails.domain.port.out.ProductImageRepositoryPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ProductImageRepositoryMySqlAdapter
        implements ProductImageRepositoryPort {

    private final JdbcTemplate jdbcTemplate;

    public ProductImageRepositoryMySqlAdapter(
            JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void saveImage(
            Long productId,
            String imagePath,
            String alternativeText,
            boolean primary) {

        if (primary) {
            jdbcTemplate.update("""
                UPDATE imagen_producto
                SET es_principal = FALSE
                WHERE id_producto = ?
                """, productId);
        }

        Integer nextOrder = jdbcTemplate.queryForObject("""
            SELECT COALESCE(MAX(orden_visual), 0) + 1
            FROM imagen_producto
            WHERE id_producto = ?
            """, Integer.class, productId);

        jdbcTemplate.update("""
            INSERT INTO imagen_producto (
                id_producto,
                ruta_archivo,
                texto_alternativo,
                es_principal,
                orden_visual
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            productId,
            imagePath,
            alternativeText,
            primary,
            nextOrder == null ? 1 : nextOrder
        );
    }

    @Override
    public List<String> findImagePathsByProductId(Long productId) {
        return jdbcTemplate.queryForList("""
            SELECT ruta_archivo
            FROM imagen_producto
            WHERE id_producto = ?
            ORDER BY es_principal DESC, orden_visual ASC
            """, String.class, productId);
    }
}