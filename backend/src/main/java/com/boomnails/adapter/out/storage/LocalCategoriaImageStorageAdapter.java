package com.boomnails.adapter.out.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import com.boomnails.domain.port.out.CategoriaImageStoragePort;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Component
public class LocalCategoriaImageStorageAdapter
        implements CategoriaImageStoragePort {

    private static final Set<String> ALLOWED_TYPES =
            Set.of("image/jpeg", "image/png", "image/webp");

    private final Path uploadDirectory;

    public LocalCategoriaImageStorageAdapter(
            @Value("${app.upload.directory:./uploads/productos}")
            String uploadDirectory) {

        this.uploadDirectory = Paths.get(uploadDirectory)
                .toAbsolutePath()
                .normalize()
                .resolve("categorias")
                .normalize();
    }

    @Override
        public String save(Long categoryId, MultipartFile file) {

        if (categoryId == null || categoryId <= 0) {
            throw new IllegalArgumentException(
                    "El identificador de la categoría no es válido");
        }

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Debes seleccionar una imagen");
        }

        if (file.getSize() > 5L * 1024 * 1024) {
            throw new IllegalArgumentException(
                    "La imagen no puede superar los 5 MB");
        }

        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException(
                    "Solo se permiten imágenes JPG, PNG o WEBP");
        }

        String extension = switch (file.getContentType()) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> throw new IllegalArgumentException(
                    "Formato de imagen no permitido");
        };

        String fileName = categoryId + "-"
                + UUID.randomUUID() + extension;

        try {
            Files.createDirectories(uploadDirectory);

            Path destination = uploadDirectory
                    .resolve(fileName)
                    .normalize();

            if (!destination.startsWith(uploadDirectory)) {
                throw new IllegalArgumentException(
                        "La ruta del archivo no es válida");
            }

            Files.copy(
                    file.getInputStream(),
                    destination,
                    StandardCopyOption.REPLACE_EXISTING
            );

            return "/uploads/categorias/" + fileName;

        } catch (IOException exception) {
            throw new IllegalStateException(
                    "No fue posible guardar la imagen", exception);
        }
    }

    @Override
        public void delete(String imageUrl) {

            if (imageUrl == null || imageUrl.isBlank()) {
                return;
            }

            String prefix = "/uploads/categorias/";

            if (!imageUrl.startsWith(prefix)) {
                throw new IllegalArgumentException(
                        "La ruta de la imagen no es válida");
            }

            String fileName = Path.of(imageUrl)
                    .getFileName()
                    .toString();

            Path imagePath = uploadDirectory
                    .resolve(fileName)
                    .normalize();

            if (!imagePath.startsWith(uploadDirectory)) {
                throw new IllegalArgumentException(
                        "Ruta de imagen no permitida");
            }

            try {
                Files.deleteIfExists(imagePath);
            } catch (IOException e) {
                throw new IllegalStateException(
                        "No se pudo eliminar la imagen de la categoría", e);
            }
        }
}
