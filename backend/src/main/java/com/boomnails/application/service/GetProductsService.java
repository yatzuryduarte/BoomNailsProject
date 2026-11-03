
package com.boomnails.application.service;

import com.boomnails.domain.model.Product;
import com.boomnails.domain.port.in.GetProductsUseCase;
import com.boomnails.domain.port.out.ProductRepositoryPort;

import java.util.List;
import java.util.Optional;

public class GetProductsService implements GetProductsUseCase {

    private final ProductRepositoryPort productRepositoryPort;

    public GetProductsService(
            ProductRepositoryPort productRepositoryPort) {
        this.productRepositoryPort = productRepositoryPort;
    }

    @Override
    public List<Product> getAllActiveProducts() {
        return productRepositoryPort.findAllActive();
    }

    @Override
    public Optional<Product> getProductById(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException(
                    "El identificador del producto no es válido");
        }

        return productRepositoryPort.findById(id);
    }
}

