
package com.boomnails.adapter.out.persistence;

import com.boomnails.domain.port.out.PaymentReceiptRepositoryPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class PaymentReceiptRepositoryMySqlAdapter
        implements PaymentReceiptRepositoryPort {

    private final JdbcTemplate jdbcTemplate;

    public PaymentReceiptRepositoryMySqlAdapter(
            JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void save(
            Long paymentId,
            String filePath,
            String mimeType,
            long sizeBytes) {

        if (paymentId == null || paymentId <= 0) {
            throw new IllegalArgumentException(
                    "El identificador del pago no es válido.");
        }

        if (filePath == null || filePath.isBlank()) {
            throw new IllegalArgumentException(
                    "La ruta del comprobante es obligatoria.");
        }

        if (mimeType == null || mimeType.isBlank()) {
            throw new IllegalArgumentException(
                    "El tipo de archivo es obligatorio.");
        }

        if (sizeBytes <= 0) {
            throw new IllegalArgumentException(
                    "El tamaño del comprobante no es válido.");
        }

        jdbcTemplate.update("""
            INSERT INTO comprobante_pago (
                id_pago,
                ruta_archivo,
                tipo_mime,
                tamano_bytes
            )
            VALUES (?, ?, ?, ?)
            """,
            paymentId,
            filePath,
            mimeType,
            sizeBytes
        );
    }
}
