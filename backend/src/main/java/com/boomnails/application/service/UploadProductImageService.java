
package com.boomnails.application.service;

import com.boomnails.domain.port.in.UploadProductImageUseCase;
import com.boomnails.domain.port.out.ProductImageStoragePort;
import com.boomnails.domain.port.out.ProductImageRepositoryPort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class UploadProductImageService
        implements UploadProductImageUseCase {

    private final ProductImageStoragePort imageStoragePort;
    private final ProductImageRepositoryPort imageRepositoryPort;

    public UploadProductImageService(
            ProductImageStoragePort imageStoragePort,
            ProductImageRepositoryPort imageRepositoryPort) {
        this.imageStoragePort = imageStoragePort;
        this.imageRepositoryPort = imageRepositoryPort;
    }

    @Override
    public String upload(
            Long productId,
            MultipartFile file,
            String alternativeText,
            boolean primary) {

        if (productId == null || productId <= 0) {
            throw new IllegalArgumentException(
                    "El identificador del producto no es válido");
        }

        if (alternativeText == null || alternativeText.isBlank()) {
            throw new IllegalArgumentException(
                    "El texto alternativo de la imagen es obligatorio");
        }

        String imagePath = imageStoragePort.save(productId, file);

        imageRepositoryPort.saveImage(
                productId,
                imagePath,
                alternativeText,
                primary
        );

        return imagePath;
    }
}
