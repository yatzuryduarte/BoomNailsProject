package com.boomnails.adapter.in.web;

import com.boomnails.application.service.InventoryExitService;
import com.boomnails.domain.model.InventoryExit;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/inventory/exits")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175"
})
public class AdminInventoryExitController {

    private final InventoryExitService exitService;

    public AdminInventoryExitController(
            InventoryExitService exitService
    ) {
        this.exitService = exitService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> registerExit(
            @RequestBody InventoryExitRequest request,
            Authentication authentication
    ) {

        InventoryExit exit = new InventoryExit(
                request.presentationId(),
                request.quantity(),
                request.reason(),
                request.reference(),
                request.notes()
        );

        Long movementId = exitService.registerExit(
                exit,
                authentication.getName()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(Map.of(
                        "mensaje", "Salida registrada correctamente",
                        "idMovimiento", movementId
                ));
    }

    public record InventoryExitRequest(
            Long presentationId,
            Integer quantity,
            String reason,
            String reference,
            String notes
    ) {}
}