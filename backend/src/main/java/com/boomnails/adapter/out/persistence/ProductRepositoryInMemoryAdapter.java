
package com.boomnails.adapter.out.persistence;

import com.boomnails.domain.model.Product;
import com.boomnails.domain.port.out.ProductRepositoryPort;

import java.util.List;
import java.util.Optional;

public class ProductRepositoryInMemoryAdapter
        implements ProductRepositoryPort {

    @Override
    public List<Product> findAllActive() {
        return List.of();
    }

    @Override
    public Optional<Product> findById(Long id) {
        return Optional.empty();
    }
}
