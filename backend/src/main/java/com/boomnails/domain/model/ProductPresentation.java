
package com.boomnails.domain.model;

import java.math.BigDecimal;

public class ProductPresentation {

    private final Long id;
    private final Long productId;
    private final String name;
    private final String size;
    private final BigDecimal retailPrice;
    private final BigDecimal wholesalePrice;
    private final Integer stock;
    private final boolean active;

    public ProductPresentation(
            Long id,
            Long productId,
            String name,
            String size,
            BigDecimal retailPrice,
            BigDecimal wholesalePrice,
            Integer stock,
            boolean active) {

        if (productId == null || productId <= 0) {
            throw new IllegalArgumentException(
                    "El producto asociado es obligatorio");
        }

        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException(
                    "El nombre de la presentación es obligatorio");
        }

        if (retailPrice != null && retailPrice.signum() < 0) {
            throw new IllegalArgumentException(
                    "El precio al detal no puede ser negativo");
        }

        if (wholesalePrice != null && wholesalePrice.signum() < 0) {
            throw new IllegalArgumentException(
                    "El precio al por mayor no puede ser negativo");
        }

        if (stock == null || stock < 0) {
            throw new IllegalArgumentException(
                    "El inventario no puede ser negativo");
        }

        this.id = id;
        this.productId = productId;
        this.name = name;
        this.size = size;
        this.retailPrice = retailPrice;
        this.wholesalePrice = wholesalePrice;
        this.stock = stock;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public Long getProductId() {
        return productId;
    }

    public String getName() {
        return name;
    }

    public String getSize() {
        return size;
    }

    public BigDecimal getRetailPrice() {
        return retailPrice;
    }

    public BigDecimal getWholesalePrice() {
        return wholesalePrice;
    }

    public Integer getStock() {
        return stock;
    }

    public boolean isActive() {
        return active;
    }
}

