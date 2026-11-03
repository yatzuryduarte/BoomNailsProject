package com.boomnails.application.service;

import com.boomnails.domain.model.InventoryItem;
import com.boomnails.domain.port.out.InventoryRepositoryPort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InventoryService {

    private final InventoryRepositoryPort inventoryRepository;

    public InventoryService(InventoryRepositoryPort inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    public List<InventoryItem> getAllInventory() {
        return inventoryRepository.findAll();
    }

    public Optional<InventoryItem> getInventoryByPresentationId(
            Long presentationId
    ) {
        if (presentationId == null || presentationId <= 0) {
            throw new IllegalArgumentException(
                "El identificador de la presentación no es válido"
            );
        }

        return inventoryRepository.findByPresentationId(presentationId);
    }

    public List<InventoryItem> searchInventory(
            Long productId,
            String searchTerm,
            Long categoryId
    ) {
        if (productId != null && productId <= 0) {
            throw new IllegalArgumentException(
                "El identificador del producto no es válido"
            );
        }

        if (categoryId != null && categoryId <= 0) {
            throw new IllegalArgumentException(
                "El identificador de la categoría no es válido"
            );
        }

        return inventoryRepository.search(
            productId,
            searchTerm,
            categoryId
        );
    }
}