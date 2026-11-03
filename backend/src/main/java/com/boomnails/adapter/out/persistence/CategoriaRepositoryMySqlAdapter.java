
package com.boomnails.adapter.out.persistence;

import com.boomnails.domain.model.Categoria;
import com.boomnails.domain.port.out.CategoriaRepositoryPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@Repository
public class CategoriaRepositoryMySqlAdapter
        implements CategoriaRepositoryPort {

    private final JdbcTemplate jdbcTemplate;

    public CategoriaRepositoryMySqlAdapter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<Categoria> findAll() {

        String sql = """
            SELECT id_categoria,
                   id_categoria_padre,
                   nombre,
                   descripcion,
                   estado,
                   imagen_url
            FROM categoria
            ORDER BY id_categoria_padre, nombre
            """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {

            Long parentId = rs.getObject("id_categoria_padre") == null
                    ? null
                    : rs.getLong("id_categoria_padre");

            return new Categoria(
                    rs.getLong("id_categoria"),
                    parentId,
                    rs.getString("nombre"),
                    rs.getString("descripcion"),
                    "ACTIVA".equals(rs.getString("estado")),
                    rs.getString("imagen_url")
            );
        });
    }

    @Override
    public Optional<Categoria> findById(Long id) {

        return findAll().stream()
                .filter(categoria -> categoria.getId().equals(id))
                .findFirst();
    }

    @Override
    public Categoria save(Categoria categoria) {

        Long id = categoria.getId();

        if (id == null) {

            String sql = """
                INSERT INTO categoria
                (id_categoria_padre, nombre, descripcion, estado, imagen_url)
                VALUES (?, ?, ?, ?, ?)
                """;

            KeyHolder keyHolder = new GeneratedKeyHolder();

            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(
                        sql,
                        Statement.RETURN_GENERATED_KEYS
                );

                ps.setObject(1, categoria.getParentId());
                ps.setString(2, categoria.getName());
                ps.setString(3, categoria.getDescription());
                ps.setString(4,
                        categoria.isActive() ? "ACTIVA" : "INACTIVA");
                ps.setString(5, categoria.getImageUrl());

                return ps;
            }, keyHolder);

            id = keyHolder.getKey().longValue();

        } else {

            String sql = """
                UPDATE categoria
                SET id_categoria_padre = ?,
                    nombre = ?,
                    descripcion = ?,
                    estado = ?,
                    imagen_url = COALESCE(?, imagen_url)
                WHERE id_categoria = ?
                """;

            jdbcTemplate.update(
                    sql,
                    categoria.getParentId(),
                    categoria.getName(),
                    categoria.getDescription(),
                    categoria.isActive() ? "ACTIVA" : "INACTIVA",
                    categoria.getImageUrl(),
                    id
            );
        }

        return findById(id).orElseThrow(
                () -> new IllegalStateException(
                        "No fue posible recuperar la categoría guardada")
        );
    }

    @Override
    public boolean existsByName(String name, Long parentId) {

        String sql = """
            SELECT COUNT(*)
            FROM categoria
            WHERE LOWER(nombre) = LOWER(?)
              AND id_categoria_padre <=> ?
            """;

        Integer count = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                name,
                parentId
        );

        return count != null && count > 0;
    }

    @Override
    public void updateStatus(Long id, boolean active) {

        String sql = """
            UPDATE categoria
            SET estado = ?
            WHERE id_categoria = ?
            """;

        jdbcTemplate.update(
                sql,
                active ? "ACTIVA" : "INACTIVA",
                id
        );
    }

    @Override
    public void deleteById(Long id) {

        String sql = """
            DELETE FROM categoria
            WHERE id_categoria = ?
            """;

        jdbcTemplate.update(sql, id);
    }

    @Override
public boolean hasProducts(Long categoryId) {
    String sql = """
        SELECT COUNT(*)
        FROM producto
        WHERE id_categoria = ?
        """;

    Integer count = jdbcTemplate.queryForObject(
        sql,
        Integer.class,
        categoryId
    );

    return count != null && count > 0;
}

    @Override
    public boolean hasSubcategories(Long categoryId) {
        String sql = """
            SELECT COUNT(*)
            FROM categoria
            WHERE id_categoria_padre = ?
            """;

        Integer count = jdbcTemplate.queryForObject(
            sql,
            Integer.class,
            categoryId
        );

        return count != null && count > 0;
    }
}
