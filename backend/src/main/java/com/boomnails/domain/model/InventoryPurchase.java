package com.boomnails.domain.model;

import java.time.LocalDateTime;
import java.util.List;

public class InventoryPurchase {

    private final Long supplierId;
    private final String invoiceNumber;
    private final LocalDateTime purchaseDate;
    private final String notes;
    private final List<InventoryPurchaseLine> lines;

    public InventoryPurchase(
            Long supplierId,
            String invoiceNumber,
            LocalDateTime purchaseDate,
            String notes,
            List<InventoryPurchaseLine> lines) {

        if (supplierId == null || supplierId <= 0) {
            throw new IllegalArgumentException("El proveedor es obligatorio");
        }

        if (purchaseDate == null) {
            throw new IllegalArgumentException("La fecha de compra es obligatoria");
        }

        if (lines == null || lines.isEmpty()) {
            throw new IllegalArgumentException(
                    "La compra debe contener al menos un producto");
        }

        this.supplierId = supplierId;
        this.invoiceNumber = invoiceNumber;
        this.purchaseDate = purchaseDate;
        this.notes = notes;
        this.lines = List.copyOf(lines);
    }

    public Long getSupplierId() {
        return supplierId;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public LocalDateTime getPurchaseDate() {
        return purchaseDate;
    }

    public String getNotes() {
        return notes;
    }

    public List<InventoryPurchaseLine> getLines() {
        return lines;
    }
}