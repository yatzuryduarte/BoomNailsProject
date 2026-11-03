
package com.boomnails.domain.model;

import java.math.BigDecimal;

public class InventoryItem {

    private final Long presentationId;
    private final Long productId;
    private final String reference;
    private final String productName;
    private final Long categoryId;
    private final String categoryName;
    private final String presentationName;
    private final String size;
    private final String imageUrl;
    private final BigDecimal averageCost;
    private final BigDecimal retailPrice;
    private final BigDecimal wholesalePrice;
    private final Integer stock;
    private final Integer minimumStock;
    private final boolean productActive;
    private final boolean presentationActive;

    public InventoryItem(
            Long presentationId,
            Long productId,
            String reference,
            String productName,
            Long categoryId,
            String categoryName,
            String presentationName,
            String size,
            String imageUrl,
            BigDecimal averageCost,
            BigDecimal retailPrice,
            BigDecimal wholesalePrice,
            Integer stock,
            Integer minimumStock,
            boolean productActive,
            boolean presentationActive) {

        if (presentationId == null || productId == null) {
            throw new IllegalArgumentException(
                    "La presentación y el producto son obligatorios");
        }

        if (stock == null || stock < 0) {
            throw new IllegalArgumentException(
                    "El stock no puede ser negativo");
        }

        if (minimumStock == null || minimumStock < 0) {
            throw new IllegalArgumentException(
                    "El stock mínimo no puede ser negativo");
        }

        this.presentationId = presentationId;
        this.productId = productId;
        this.reference = reference;
        this.productName = productName;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.presentationName = presentationName;
        this.size = size;
        this.imageUrl = imageUrl;
        this.averageCost = averageCost;
        this.retailPrice = retailPrice;
        this.wholesalePrice = wholesalePrice;
        this.stock = stock;
        this.minimumStock = minimumStock;
        this.productActive = productActive;
        this.presentationActive = presentationActive;
    }

    public Long getPresentationId() {
        return presentationId;
    }

    public Long getProductId() {
        return productId;
    }

    public String getReference() {
        return reference;
    }

    public String getProductName() {
        return productName;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public String getPresentationName() {
        return presentationName;
    }

    public String getSize() {
        return size;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public BigDecimal getAverageCost() {
        return averageCost;
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

    public Integer getMinimumStock() {
        return minimumStock;
    }

    public boolean isProductActive() {
        return productActive;
    }

    public boolean isPresentationActive() {
        return presentationActive;
    }
}
