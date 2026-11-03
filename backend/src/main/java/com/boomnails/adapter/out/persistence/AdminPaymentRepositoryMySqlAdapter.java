
package com.boomnails.adapter.out.persistence;

import com.boomnails.domain.port.out.AdminPaymentRepositoryPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class AdminPaymentRepositoryMySqlAdapter
        implements AdminPaymentRepositoryPort {

    private final JdbcTemplate jdbcTemplate;

    public AdminPaymentRepositoryMySqlAdapter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<PendingPayment> findPendingPayments() {
        String sql = """
            SELECT
                p.id_pago,
                pe.id_pedido,
                pe.numero_pedido,
                pe.nombre_entrega,
                pe.correo_entrega,
                p.importe,
                p.metodo,
                p.estado AS estado_pago,
                cp.ruta_archivo,
                cp.tipo_mime,
                cp.tamano_bytes,
                cp.fecha_subida
            FROM pago p
            INNER JOIN pedido pe
                ON pe.id_pedido = p.id_pedido
            INNER JOIN comprobante_pago cp
                ON cp.id_pago = p.id_pago
            WHERE p.estado = 'PENDIENTE'
              AND cp.estado_revision = 'PENDIENTE'
            ORDER BY cp.fecha_subida ASC
            """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> mapPayment(rs));
    }

    private PendingPayment mapPayment(ResultSet rs)
            throws SQLException {
        return new PendingPayment(
                rs.getLong("id_pago"),
                rs.getLong("id_pedido"),
                rs.getString("numero_pedido"),
                rs.getString("nombre_entrega"),
                rs.getString("correo_entrega"),
                rs.getBigDecimal("importe"),
                rs.getString("metodo"),
                rs.getString("estado_pago"),
                rs.getString("ruta_archivo"),
                rs.getString("tipo_mime"),
                rs.getLong("tamano_bytes"),
                rs.getTimestamp("fecha_subida").toLocalDateTime()
        );
    }
}
