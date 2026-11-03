package com.boomnails.application.service;

import com.boomnails.domain.model.Supplier;
import com.boomnails.domain.port.out.SupplierRepositoryPort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SupplierService {

    private final SupplierRepositoryPort supplierRepository;

    public SupplierService(SupplierRepositoryPort supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    public List<Supplier> findAllActive() {
        return supplierRepository.findAllActive();
    }

    public List<Supplier> findAll() {
        return supplierRepository.findAll();
    }

    public Supplier create(Supplier supplier) {

        if (supplier == null) {
            throw new IllegalArgumentException(
                "Los datos del proveedor son obligatorios");
        }

        if (supplier.getName() == null || supplier.getName().isBlank()) {
            throw new IllegalArgumentException(
                "El nombre del proveedor es obligatorio");
        }

        return supplierRepository.save(supplier);
    }

    public Supplier update(Long id, Supplier supplier) {

        if (id == null || id <= 0) {
            throw new IllegalArgumentException(
                "El ID del proveedor no es válido");
        }

        if (supplier == null) {
            throw new IllegalArgumentException(
                "Los datos del proveedor son obligatorios");
        }

        if (supplier.getName() == null || supplier.getName().isBlank()) {
            throw new IllegalArgumentException(
                "El nombre del proveedor es obligatorio");
        }

        return supplierRepository.update(id, supplier)
            .orElseThrow(() -> new IllegalArgumentException(
                "No se encontró el proveedor que deseas actualizar"));
    }

    public boolean updateStatus(Long id, String status) {

        if (id == null) {
            throw new IllegalArgumentException(
                "El ID del proveedor es obligatorio"
            );
        }

        if (!"ACTIVO".equals(status) && !"INACTIVO".equals(status)) {
            throw new IllegalArgumentException(
                "El estado debe ser ACTIVO o INACTIVO"
            );
        }

        return supplierRepository.updateStatus(id, status);
    }

    
}