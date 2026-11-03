
package com.boomnails.domain.port.out;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface AdminPaymentRepositoryPort {

    List<PendingPayment> findPendingPayments();

    record PendingPayment(
            Long paymentId,
            Long orderId,
            String orderNumber,
            String customerName,
            String customerEmail,
            BigDecimal amount,
            String paymentMethod,
            String paymentStatus,
            String receiptPath,
            String receiptMimeType,
            Long receiptSizeBytes,
            LocalDateTime receiptUploadedAt
    ) {}
}
