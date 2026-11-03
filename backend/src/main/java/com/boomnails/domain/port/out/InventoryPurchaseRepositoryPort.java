package com.boomnails.domain.port.out;

import com.boomnails.domain.model.InventoryPurchase;

public interface InventoryPurchaseRepositoryPort {

    Long registerPurchase(
            InventoryPurchase purchase,
            String authenticatedEmail
    );
}