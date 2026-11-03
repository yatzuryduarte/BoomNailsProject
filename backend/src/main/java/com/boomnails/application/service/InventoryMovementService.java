package com.boomnails.application.service;

import com.boomnails.domain.port.out.InventoryMovementRepositoryPort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class InventoryMovementService {

    private final InventoryMovementRepositoryPort movementRepository;

    public InventoryMovementService(
            InventoryMovementRepositoryPort movementRepository) {
        this.movementRepository = movementRepository;
    }

    public List<Map<String, Object>> getAllMovements() {
        return movementRepository.findAllMovements();
    }
}