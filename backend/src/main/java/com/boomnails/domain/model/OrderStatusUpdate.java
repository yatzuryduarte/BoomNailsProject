package com.boomnails.domain.model;

public record OrderStatusUpdate(
    String status,
    String carrier,
    String trackingNumber
) {}