
package com.boomnails.application.service;

import com.boomnails.domain.port.out.PaymentReceiptRepositoryPort;
import com.boomnails.domain.port.out.PaymentReceiptStoragePort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.boomnails.domain.port.out.PaymentRepositoryPort;

@Service
public class UploadPaymentReceiptService {

    private final PaymentReceiptStoragePort storagePort;
    private final PaymentReceiptRepositoryPort repositoryPort;
    private final PaymentRepositoryPort paymentRepositoryPort;

    public UploadPaymentReceiptService(
            PaymentReceiptStoragePort storagePort,
            PaymentReceiptRepositoryPort repositoryPort,
            PaymentRepositoryPort paymentRepositoryPort) {
                
        this.storagePort = storagePort;
        this.repositoryPort = repositoryPort;
        this.paymentRepositoryPort = paymentRepositoryPort;
    }

    public void upload(
            Long orderId,
            Long paymentId,
            MultipartFile file) {

        if (orderId == null || orderId <= 0) {
            throw new IllegalArgumentException(
                    "El identificador del pedido no es válido.");
        }

        if (paymentId == null || paymentId <= 0) {
            throw new IllegalArgumentException(
                    "El identificador del pago no es válido.");
        }

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Debes adjuntar el comprobante de pago.");
        }

                boolean paymentBelongsToOrder =
                paymentRepositoryPort.belongsToOrder(paymentId, orderId);

        if (!paymentBelongsToOrder) {
            throw new IllegalArgumentException(
                    "El pago no corresponde al pedido o ya no está pendiente.");
}

        String mimeType = file.getContentType();

        if (mimeType == null || mimeType.isBlank()) {
            throw new IllegalArgumentException(
                    "No fue posible identificar el tipo de archivo.");
        }

        String filePath = storagePort.save(orderId, file);

        try {
            repositoryPort.save(
                    paymentId,
                    filePath,
                    mimeType,
                    file.getSize()
            );
        } catch (RuntimeException exception) {
            try {
                storagePort.delete(filePath);
            } catch (RuntimeException cleanupException) {
                exception.addSuppressed(cleanupException);
            }

            throw exception;
        }
    }
}
