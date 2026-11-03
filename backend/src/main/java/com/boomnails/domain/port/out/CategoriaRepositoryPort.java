
package com.boomnails.domain.port.out;

import com.boomnails.domain.model.Categoria;
import java.util.List;
import java.util.Optional;

public interface CategoriaRepositoryPort {

    List<Categoria> findAll();

    Optional<Categoria> findById(Long id);

    Categoria save(Categoria categoria);

    boolean existsByName(String name, Long parentId);

    void updateStatus(Long id, boolean active);

    void deleteById(Long id);

    boolean hasProducts(Long categoryId);

    boolean hasSubcategories(Long categoryId);
}

