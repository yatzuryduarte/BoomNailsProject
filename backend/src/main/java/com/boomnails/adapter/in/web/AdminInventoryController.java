package com.boomnails.adapter.in.web;

import com.boomnails.application.service.InventoryService;
import com.boomnails.domain.model.InventoryItem;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/inventory")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175"
})
public class AdminInventoryController {

    private final InventoryService inventoryService;

    public AdminInventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    // Consultar todo el inventario
    @GetMapping
    public ResponseEntity<List<InventoryItem>> getAllInventory() {
        return ResponseEntity.ok(
            inventoryService.getAllInventory()
        );
    }

    // Consultar una presentación específica
    @GetMapping("/{presentationId:\\d+}")
    public ResponseEntity<InventoryItem> getInventoryByPresentationId(
            @PathVariable Long presentationId
    ) {
        return inventoryService
            .getInventoryByPresentationId(presentationId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // Buscar y filtrar inventario
    @GetMapping("/search")
    public ResponseEntity<List<InventoryItem>> searchInventory(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) Long categoryId
    ) {
        return ResponseEntity.ok(
            inventoryService.searchInventory(
                productId,
                searchTerm,
                categoryId
            )
        );
    }
}
