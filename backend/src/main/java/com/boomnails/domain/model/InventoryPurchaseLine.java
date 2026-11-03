
package com.boomnails.domain.model;

import java.math.BigDecimal;

public class InventoryPurchaseLine {

    private final Long presentationId;
    private final Integer quantity;
    private final BigDecimal unitCost;
    private final String notes;

    public InventoryPurchaseLine(
            Long presentationId,
            Integer quantity,
            BigDecimal unitCost,
            String notes
    ) {
        if (presentationId == null || presentationId <= 0) {
            throw new IllegalArgumentException(
                "La presentación es obligatoria"
            );
        }

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException(
                "La cantidad debe ser mayor que cero"
            );
        }

        if (unitCost == null || unitCost.signum() < 0) {
            throw new IllegalArgumentException(
                "El costo unitario no puede ser negativo"
            );
        }

        this.presentationId = presentationId;
        this.quantity = quantity;
        this.unitCost = unitCost;
        this.notes = notes;
    }

    public Long getPresentationId() {
        return presentationId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public BigDecimal getUnitCost() {
        return unitCost;
    }

    public String getNotes() {
        return notes;
    }

    public BigDecimal getSubtotal() {
        return unitCost.multiply(BigDecimal.valueOf(quantity));
    }
}
