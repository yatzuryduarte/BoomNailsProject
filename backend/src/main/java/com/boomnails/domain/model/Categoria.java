package com.boomnails.domain.model;

public class Categoria {

    private final Long id;
    private final Long parentId;
    private final String name;
    private final String description;
    private final boolean active;
    private final String imageUrl;

    public Categoria(
            Long id,
            Long parentId,
            String name,
            String description,
            boolean active) {

        this(id, parentId, name, description, active, null);
    }

    public Categoria(
            Long id,
            Long parentId,
            String name,
            String description,
            boolean active,
            String imageUrl) {

        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException(
                    "El nombre de la categoría es obligatorio");
        }

        this.id = id;
        this.parentId = parentId;
        this.name = name;
        this.description = description;
        this.active = active;
        this.imageUrl = imageUrl;
    }

    public Long getId() {
        return id;
    }

    public Long getParentId() {
        return parentId;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public boolean isActive() {
        return active;
    }

    public String getImageUrl() {
        return imageUrl;
    }
}