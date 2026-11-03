
package com.boomnails.adapter.out.storage;

import com.boomnails.domain.port.out.PaymentReceiptStoragePort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Component
public class LocalPaymentReceiptStorageAdapter
        implements PaymentReceiptStoragePort {

    private static final long MAX_SIZE = 5L * 1024 * 1024;

    private static final Set<String> ALLOWED_TYPES =
            Set.of("image/jpeg", "image/png", "application/pdf");

    private final Path uploadDirectory;

    public LocalPaymentReceiptStorageAdapter(
            @Value("${app.upload.receipts-directory:./uploads/comprobantes}")
            String directory) {

        this.uploadDirectory = Paths.get(directory)
                .toAbsolutePath()
                .normalize();
    }

    @Override
    public String save(Long orderId, MultipartFile file) {
        if (orderId == null || orderId <= 0) {
            throw new IllegalArgumentException(
                    "El identificador del pedido no es válido.");
        }

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Debes adjuntar el comprobante de pago.");
        }

        if (file.getSize() > MAX_SIZE) {
            throw new IllegalArgumentException(
                    "El comprobante no puede superar los 5 MB.");
        }

        String contentType = file.getContentType();

        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException(
                    "Solo se permiten comprobantes JPG, PNG o PDF.");
        }

        String extension = switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "application/pdf" -> ".pdf";
            default -> throw new IllegalArgumentException(
                    "Formato de comprobante no permitido.");
        };

        String fileName = orderId + "-" + UUID.randomUUID() + extension;

        try {
            Files.createDirectories(uploadDirectory);

            Path destination = uploadDirectory.resolve(fileName)
                    .normalize();

            if (!destination.startsWith(uploadDirectory)) {
                throw new IllegalArgumentException(
                        "La ruta del archivo no es válida.");
            }

            Files.copy(file.getInputStream(), destination);

            return "/uploads/comprobantes/" + fileName;

        } catch (IOException exception) {
            throw new IllegalStateException(
                    "No fue posible guardar el comprobante.", exception);
        }
    }

    @Override
    public void delete(String filePath) {
        if (filePath == null || filePath.isBlank()) {
            return;
        }

        String fileName = filePath.substring(
                filePath.lastIndexOf('/') + 1
        );

        Path file = uploadDirectory.resolve(fileName).normalize();

        if (!file.startsWith(uploadDirectory)) {
            throw new IllegalArgumentException(
                    "La ruta del comprobante no es válida."
            );
        }

        try {
            Files.deleteIfExists(file);
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "No fue posible eliminar el comprobante.", exception
            );
        }
    }
}
