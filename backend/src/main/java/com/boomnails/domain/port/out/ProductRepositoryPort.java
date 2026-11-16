
package com.boomnails.domain.port.out;

import com.boomnails.domain.model.CreateProductCommand;
import com.boomnails.domain.model.Product;
import com.boomnails.domain.model.UpdateProductCommand;

import java.util.List;
import java.util.Optional;

public interface ProductRepositoryPort {

    List<Product> findAllActive();

    Optional<Product> findById(Long id);

// Consultas administrativas
    List<Product> findAll();

    Optional<Product> findByIdForAdmin(Long id);

    // Validaciones
    boolean existsByReference(String reference);

    boolean existsByReferenceExcludingId(String reference, Long productId);

    // CRUD de producto
    Long save(CreateProductCommand command);

    void update(UpdateProductCommand command);

    void updateStatus(Long productId, boolean active);

    void deleteById(Long productId);
}