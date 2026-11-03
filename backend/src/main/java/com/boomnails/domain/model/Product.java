
package com.boomnails.domain.model;

import java.util.List;

public class Product {

    private final Long id;
    private final String reference;
    private final String name;
    private final String description;
    private final Long categoryId;
    private final boolean active;
    private final List<ProductPresentation> presentations;
    private final String imageUrl;

    public Product(
            Long id,
            String reference,
            String name,
            String description,
            Long categoryId,
            boolean active,
            List<ProductPresentation> presentations,
            String imageUrl) {

        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException(
                    "El nombre del producto es obligatorio");
        }

        if (categoryId == null || categoryId <= 0) {
            throw new IllegalArgumentException(
                    "La categoría del producto es obligatoria");
        }

        this.id = id;
        this.reference = reference;
        this.name = name;
        this.description = description;
        this.categoryId = categoryId;
        this.active = active;
        this.presentations = presentations == null
                ? List.of()
                : List.copyOf(presentations);
        this.imageUrl = imageUrl;
    }

    public Long getId() {
        return id;
    }

    public String getReference() {
        return reference;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public boolean isActive() {
        return active;
    }

    public List<ProductPresentation> getPresentations() {
        return presentations;
    }

    public String getImageUrl() {
        return imageUrl;
    }
}
