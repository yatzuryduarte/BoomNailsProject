
package com.boomnails.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.receipts-directory:./uploads/comprobantes}")
    private String receiptsDirectory;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path receiptsPath = Path.of(receiptsDirectory)
                .toAbsolutePath()
                .normalize();

        registry.addResourceHandler("/uploads/comprobantes/**")
                .addResourceLocations(receiptsPath.toUri().toString());
    }
}
