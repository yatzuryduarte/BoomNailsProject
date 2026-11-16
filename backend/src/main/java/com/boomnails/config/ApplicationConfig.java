package com.boomnails.config;

import com.boomnails.application.service.GetProductsService;
import com.boomnails.application.service.ManageProductsService;
import com.boomnails.domain.port.in.GetProductsUseCase;
import com.boomnails.domain.port.in.ManageProductsUseCase;
import com.boomnails.domain.port.out.ProductRepositoryPort;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ApplicationConfig {

    @Bean
    public GetProductsUseCase getProductsUseCase(
            ProductRepositoryPort productRepositoryPort) {

        return new GetProductsService(productRepositoryPort);
    }

    @Bean
    public ManageProductsUseCase manageProductsUseCase(
            ProductRepositoryPort productRepositoryPort) {

        return new ManageProductsService(productRepositoryPort);
    }
}