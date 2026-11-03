package com.boomnails.adapter.in.web.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record InventoryPurchaseRequest(
        Long supplierId,
        String invoiceNumber,
        LocalDateTime purchaseDate,
        String notes,
        List<PurchaseLineRequest> lines
) {

    public record PurchaseLineRequest(
            Long presentationId,
            Integer quantity,
            BigDecimal unitCost,
            String notes
    ) {
    }
}
