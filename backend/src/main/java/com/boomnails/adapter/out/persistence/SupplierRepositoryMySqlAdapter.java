package com.boomnails.adapter.out.persistence;

import com.boomnails.domain.model.Supplier;
import com.boomnails.domain.port.out.SupplierRepositoryPort;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@Repository
public class SupplierRepositoryMySqlAdapter implements SupplierRepositoryPort {

    private final JdbcTemplate jdbcTemplate;

    public SupplierRepositoryMySqlAdapter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<Supplier> findAllActive() {

        String sql = """
            SELECT
                id_proveedor,
                nombre,
                identificacion,
                telefono,
                correo,
                direccion,
                observaciones,
                estado
            FROM proveedor
            WHERE estado = 'ACTIVO'
            ORDER BY nombre ASC
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) ->
            new Supplier(
                rs.getLong("id_proveedor"),
                rs.getString("nombre"),
                rs.getString("identificacion"),
                rs.getString("telefono"),
                rs.getString("correo"),
                rs.getString("direccion"),
                rs.getString("observaciones"),
                rs.getString("estado")
            )
        );
    }

    @Override
    public List<Supplier> findAll() {
        String sql = """
            SELECT
                id_proveedor,
                nombre,
                identificacion,
                telefono,
                correo,
                direccion,
                observaciones,
                estado
            FROM proveedor
            ORDER BY id_proveedor DESC
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) ->
            new Supplier(
                rs.getLong("id_proveedor"),
                rs.getString("nombre"),
                rs.getString("identificacion"),
                rs.getString("telefono"),
                rs.getString("correo"),
                rs.getString("direccion"),
                rs.getString("observaciones"),
                rs.getString("estado")
            )
        );
    }

    @Override
    public Supplier save(Supplier supplier) {

        String sql = """
            INSERT INTO proveedor (
                nombre,
                identificacion,
                telefono,
                correo,
                direccion,
                observaciones,
                estado
            )
            VALUES (?, ?, ?, ?, ?, ?, 'ACTIVO')
        """;

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                sql,
                Statement.RETURN_GENERATED_KEYS
            );

            ps.setString(1, supplier.getName());
            ps.setString(2, supplier.getIdentification());
            ps.setString(3, supplier.getPhone());
            ps.setString(4, supplier.getEmail());
            ps.setString(5, supplier.getAddress());
            ps.setString(6, supplier.getNotes());

            return ps;
        }, keyHolder);

        Long generatedId = keyHolder.getKey().longValue();

        return new Supplier(
            generatedId,
            supplier.getName(),
            supplier.getIdentification(),
            supplier.getPhone(),
            supplier.getEmail(),
            supplier.getAddress(),
            supplier.getNotes(),
            "ACTIVO"
        );
    }

    @Override
    public Optional<Supplier> update(Long id, Supplier supplier) {

        String sql = """
            UPDATE proveedor
            SET
                nombre = ?,
                identificacion = ?,
                telefono = ?,
                correo = ?,
                direccion = ?,
                observaciones = ?
            WHERE id_proveedor = ?
        """;

        int rowsAffected = jdbcTemplate.update(
            sql,
            supplier.getName(),
            supplier.getIdentification(),
            supplier.getPhone(),
            supplier.getEmail(),
            supplier.getAddress(),
            supplier.getNotes(),
            id
        );

        if (rowsAffected == 0) {
            return Optional.empty();
        }

        String selectSql = """
            SELECT
                id_proveedor,
                nombre,
                identificacion,
                telefono,
                correo,
                direccion,
                observaciones,
                estado
            FROM proveedor
            WHERE id_proveedor = ?
        """;

        Supplier updated = jdbcTemplate.queryForObject(
            selectSql,
            (rs, rowNum) -> new Supplier(
                rs.getLong("id_proveedor"),
                rs.getString("nombre"),
                rs.getString("identificacion"),
                rs.getString("telefono"),
                rs.getString("correo"),
                rs.getString("direccion"),
                rs.getString("observaciones"),
                rs.getString("estado")
            ),
            id
        );

        return Optional.of(updated);
    }

    @Override
    public boolean updateStatus(Long id, String status) {

        String sql = """
            UPDATE proveedor
            SET estado = ?
            WHERE id_proveedor = ?
        """;

        int rowsAffected = jdbcTemplate.update(
            sql,
            status,
            id
        );

        return rowsAffected > 0;
    }
}