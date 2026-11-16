package com.boomnails.domain.port.in;

import com.boomnails.domain.model.CreateProductCommand;
import com.boomnails.domain.model.Product;
import com.boomnails.domain.model.UpdateProductCommand;

import java.util.List;
import java.util.Optional;

public interface ManageProductsUseCase {

    List<Product> getAllProducts();

    Optional<Product> getProductById(Long id);

    Long createProduct(CreateProductCommand command);

    void updateProduct(UpdateProductCommand command);

    void updateProductStatus(Long id, boolean active);

    void deleteProduct(Long id);
}