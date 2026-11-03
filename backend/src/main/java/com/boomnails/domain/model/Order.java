
package com.boomnails.domain.model;

import java.util.List;

public record Order(
    Long customerId,
    String customerName,
    String customerEmail,
    String customerPhone,
    String shippingAddress,
    String shippingCity,
    String shippingDepartment,
    String shippingCountry,
    String deliveryNote,
    List<OrderItem> items
) {
    public record OrderItem(
        Long presentationId,
        int quantity
    ) {}
}
