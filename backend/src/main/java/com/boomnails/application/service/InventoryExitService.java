package com.boomnails.application.service;

import com.boomnails.domain.model.InventoryExit;
import com.boomnails.domain.port.out.InventoryExitRepositoryPort;
import org.springframework.stereotype.Service;

@Service
public class InventoryExitService {

    private final InventoryExitRepositoryPort exitRepository;

    public InventoryExitService(
            InventoryExitRepositoryPort exitRepository
    ) {
        this.exitRepository = exitRepository;
    }

    public Long registerExit(
            InventoryExit exit,
            String authenticatedEmail
    ) {
        if (exit == null) {
            throw new IllegalArgumentException(
                    "La información de la salida es obligatoria"
            );
        }

        if (exit.getPresentationId() == null ||
                exit.getPresentationId() <= 0) {
            throw new IllegalArgumentException(
                    "La presentación seleccionada no es válida"
            );
        }

        if (exit.getQuantity() == null ||
                exit.getQuantity() <= 0) {
            throw new IllegalArgumentException(
                    "La cantidad debe ser mayor que cero"
            );
        }

        if (exit.getReason() == null ||
                exit.getReason().isBlank()) {
            throw new IllegalArgumentException(
                    "El motivo de la salida es obligatorio"
            );
        }

        if (authenticatedEmail == null ||
                authenticatedEmail.isBlank()) {
            throw new IllegalArgumentException(
                    "No se pudo identificar al administrador"
            );
        }

        return exitRepository.registerExit(
                exit,
                authenticatedEmail
        );
    }
}
