
package com.boomnails.domain.port.in;

import com.boomnails.domain.model.Product;
import java.util.List;
import java.util.Optional;

public interface GetProductsUseCase {

    List<Product> getAllActiveProducts();

    Optional<Product> getProductById(Long id);
}

