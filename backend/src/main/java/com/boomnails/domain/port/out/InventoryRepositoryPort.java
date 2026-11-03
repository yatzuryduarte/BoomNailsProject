
package com.boomnails.domain.port.out;

import com.boomnails.domain.model.InventoryItem;

import java.util.List;
import java.util.Optional;

public interface InventoryRepositoryPort {

    List<InventoryItem> findAll();

    Optional<InventoryItem> findByPresentationId(Long presentationId);

    List<InventoryItem> search(
            Long productId,
            String searchTerm,
            Long categoryId
    );
}
