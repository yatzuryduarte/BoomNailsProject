package com.boomnails.application.service;

import com.boomnails.domain.model.InventoryPurchase;
import com.boomnails.domain.port.out.InventoryPurchaseRepositoryPort;

import org.springframework.stereotype.Service;

@Service
public class InventoryPurchaseService {

    private final InventoryPurchaseRepositoryPort purchaseRepository;

    public InventoryPurchaseService(
            InventoryPurchaseRepositoryPort purchaseRepository) {
        this.purchaseRepository = purchaseRepository;
    }

    public Long registerPurchase(
            InventoryPurchase purchase,
            String authenticatedEmail) {

        if (purchase == null) {
            throw new IllegalArgumentException(
                    "La información de la compra es obligatoria"
            );
        }

        if (authenticatedEmail == null || authenticatedEmail.isBlank()) {
            throw new IllegalArgumentException(
                    "No se pudo identificar al administrador"
            );
        }

        return purchaseRepository.registerPurchase(
                purchase,
                authenticatedEmail
        );
    }
}
