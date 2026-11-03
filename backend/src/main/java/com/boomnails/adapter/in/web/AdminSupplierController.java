
package com.boomnails.adapter.in.web;

import com.boomnails.application.service.SupplierService;
import com.boomnails.domain.model.Supplier;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/suppliers")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175"
})
public class AdminSupplierController {

    private final SupplierService supplierService;

    public AdminSupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    // Consultar proveedores activos
    @GetMapping
    public List<Supplier> findAllActive() {
        return supplierService.findAllActive();
    }

    // Consultar todos los proveedores
    @GetMapping("/all")
    public List<Supplier> findAll() {
        return supplierService.findAll();
    }

    // Registrar proveedor
    @PostMapping
    public ResponseEntity<Supplier> create(
            @RequestBody Supplier supplier) {

        Supplier created = supplierService.create(supplier);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(created);
    }

    // Editar proveedor
    @PutMapping("/{id}")
    public ResponseEntity<Supplier> update(
            @PathVariable Long id,
            @RequestBody Supplier supplier) {

        Supplier updated = supplierService.update(id, supplier);

        return ResponseEntity.ok(updated);
    }

    // Activar o inactivar proveedor
    @PatchMapping("/{id}/status")
    public ResponseEntity<Boolean> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        boolean updated = supplierService.updateStatus(id, status);

        if (!updated) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(true);
    }
}
