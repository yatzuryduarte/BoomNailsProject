
package com.boomnails.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class ImageStorageConfig implements WebMvcConfigurer {

    private final Path uploadDirectory;

    public ImageStorageConfig(
            @Value("${app.upload.directory:./uploads/productos}")
            String uploadDirectory) {

        this.uploadDirectory = Paths.get(uploadDirectory)
                .toAbsolutePath()
                .normalize();
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        // Imágenes de productos
        registry.addResourceHandler("/uploads/productos/**")
                .addResourceLocations(
                        uploadDirectory.toUri().toString()
                );

        // Imágenes de categorías
        Path categoriasDirectory = uploadDirectory.resolve("categorias")
                .toAbsolutePath()
                .normalize();

        registry.addResourceHandler("/uploads/categorias/**")
                .addResourceLocations(
                        categoriasDirectory.toUri().toString()
                );
    }
}
