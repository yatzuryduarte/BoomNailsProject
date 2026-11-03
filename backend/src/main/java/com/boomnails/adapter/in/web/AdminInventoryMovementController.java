package com.boomnails.adapter.in.web;

import com.boomnails.application.service.InventoryMovementService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/inventory/movements")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175"
})
public class AdminInventoryMovementController {

    private final InventoryMovementService movementService;

    public AdminInventoryMovementController(
            InventoryMovementService movementService) {
        this.movementService = movementService;
    }

    @GetMapping
    public List<Map<String, Object>> getAllMovements() {
        return movementService.getAllMovements();
    }
}