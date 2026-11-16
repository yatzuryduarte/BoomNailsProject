
package com.boomnails.adapter.out.persistence;

import com.boomnails.domain.model.CreateProductCommand;
import com.boomnails.domain.model.UpdateProductCommand;
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
@Override
    public List<Product> findAll() {
        return List.of();
    }

    @Override
    public Optional<Product> findByIdForAdmin(Long id) {
        return Optional.empty();
    }

    @Override
    public boolean existsByReference(String reference) {
        return false;
    }

    @Override
    public boolean existsByReferenceExcludingId(
            String reference,
            Long productId) {

        return false;
    }

    @Override
    public Long save(CreateProductCommand command) {
        throw new UnsupportedOperationException(
                "La persistencia en memoria no está implementada"
        );
    }

    @Override
    public void update(UpdateProductCommand command) {
        throw new UnsupportedOperationException(
                "La persistencia en memoria no está implementada"
        );
    }

    @Override
    public void updateStatus(Long productId, boolean active) {
        throw new UnsupportedOperationException(
                "El adapter en memoria no soporta actualización de estado"
        );
    }

    @Override
    public void deleteById(Long productId) {
        throw new UnsupportedOperationException(
                "El adapter en memoria no soporta eliminación de productos"
        );
    }
}
