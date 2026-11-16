
package com.boomnails.domain.model;

import java.math.BigDecimal;

public class ProductPresentation {

    private final Long id;
    private final Long productId;
    private final String name;
    private final Integer volumeMl;
    private final Integer unitsPerPackage;
    private final BigDecimal retailPrice;
    private final BigDecimal wholesalePrice;
    private final Integer stock;
    private final boolean active;

    public ProductPresentation(
            Long id,
            Long productId,
            String name,
            Integer volumeMl,
            Integer unitsPerPackage,
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

        if (volumeMl != null && volumeMl <= 0) {
            throw new IllegalArgumentException(
                    "El volumen debe ser mayor que cero");
        }

        if (unitsPerPackage != null && unitsPerPackage <= 0) {
            throw new IllegalArgumentException(
                    "La cantidad por paquete debe ser mayor que cero");
        }

        /*
         * Una presentación debe definirse por volumen
         * O por cantidad de unidades, pero no por ambos.
         */
        boolean hasVolume = volumeMl != null;
        boolean hasUnits = unitsPerPackage != null;

        if (hasVolume == hasUnits) {
            throw new IllegalArgumentException(
                    "La presentación debe tener volumen en ml o cantidad por paquete, pero no ambos");
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
        this.volumeMl = volumeMl;
        this.unitsPerPackage = unitsPerPackage;
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

    public Integer getVolumeMl() {
        return volumeMl;
    }

    public Integer getUnitsPerPackage() {
        return unitsPerPackage;
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

/**
     * Mantiene compatibilidad con el frontend actual.
     *
     * Ejemplos:
     * 8 ml
     * 30 ml
     * 240 unidades
     */
    public String getSize() {
        if (volumeMl != null) {
            return volumeMl + " ml";
        }

        if (unitsPerPackage != null) {
            return unitsPerPackage + " unidades";
        }

        return "";
    }
}