package com.boomnails.domain.port.out;

import com.boomnails.domain.model.InventoryExit;

public interface InventoryExitRepositoryPort {

    Long registerExit(
            InventoryExit exit,
            String authenticatedEmail
    );
}