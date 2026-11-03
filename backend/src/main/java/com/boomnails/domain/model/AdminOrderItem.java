
package com.boomnails.domain.model;

import java.math.BigDecimal;

public record AdminOrderItem(
        Long detailId,
        Long presentationId,
        String reference,
        String productName,
        String presentation,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal
) {}
