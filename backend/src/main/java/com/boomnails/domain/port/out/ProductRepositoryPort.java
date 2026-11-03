
package com.boomnails.domain.port.out;

import com.boomnails.domain.model.Product;
import java.util.List;
import java.util.Optional;

public interface ProductRepositoryPort {

    List<Product> findAllActive();

    Optional<Product> findById(Long id);
}

