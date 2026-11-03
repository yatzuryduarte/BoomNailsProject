package com.boomnails.adapter.in.web;

import com.boomnails.adapter.in.web.dto.InventoryPurchaseRequest;
import com.boomnails.application.service.InventoryPurchaseService;
import com.boomnails.domain.model.InventoryPurchase;
import com.boomnails.domain.model.InventoryPurchaseLine;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/inventory/purchases")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175"
})
public class AdminInventoryPurchaseController {

    private final InventoryPurchaseService purchaseService;

    public AdminInventoryPurchaseController(
            InventoryPurchaseService purchaseService) {
        this.purchaseService = purchaseService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> registerPurchase(
            @RequestBody InventoryPurchaseRequest request,
            Authentication authentication) {

        List<InventoryPurchaseLine> lines = request.lines()
                .stream()
                .map(line -> new InventoryPurchaseLine(
                        line.presentationId(),
                        line.quantity(),
                        line.unitCost(),
                        line.notes()
                ))
                .toList();

        InventoryPurchase purchase = new InventoryPurchase(
                request.supplierId(),
                request.invoiceNumber(),
                request.purchaseDate(),
                request.notes(),
                lines
        );

        Long purchaseId = purchaseService.registerPurchase(
                purchase,
                authentication.getName()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(Map.of(
                        "mensaje", "Compra registrada correctamente",
                        "idCompra", purchaseId
                ));
    }
}