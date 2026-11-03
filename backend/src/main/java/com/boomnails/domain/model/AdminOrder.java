
package com.boomnails.domain.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AdminOrder(
        Long orderId,
        String orderNumber,
        String status,
        String customerName,
        String customerEmail,
        String customerPhone,
        String shippingAddress,
        String shippingCity,
        String shippingDepartment,
        String shippingCountry,
        BigDecimal total,
        String carrier,
        String trackingNumber,
        LocalDateTime createdAt,
        LocalDateTime dispatchedAt
) {}
