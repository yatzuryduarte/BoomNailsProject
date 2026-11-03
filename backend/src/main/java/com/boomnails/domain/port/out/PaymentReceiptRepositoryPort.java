
package com.boomnails.domain.port.out;

public interface PaymentReceiptRepositoryPort {

    void save(
            Long paymentId,
            String filePath,
            String mimeType,
            long sizeBytes
    );
}
