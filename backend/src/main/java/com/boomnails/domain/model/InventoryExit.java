package com.boomnails.domain.model;

public class InventoryExit {

    private final Long presentationId;
    private final Integer quantity;
    private final String reason;
    private final String reference;
    private final String notes;

    public InventoryExit(
            Long presentationId,
            Integer quantity,
            String reason,
            String reference,
            String notes
    ) {
        this.presentationId = presentationId;
        this.quantity = quantity;
        this.reason = reason;
        this.reference = reference;
        this.notes = notes;
    }

    public Long getPresentationId() {
        return presentationId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public String getReason() {
        return reason;
    }

    public String getReference() {
        return reference;
    }

    public String getNotes() {
        return notes;
    }
}