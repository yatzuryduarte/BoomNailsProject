
package com.boomnails.application.service;

import com.boomnails.domain.model.Categoria;
import com.boomnails.domain.port.out.CategoriaRepositoryPort;
import com.boomnails.domain.port.out.CategoriaImageStoragePort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
public class CategoriaService {

    private final CategoriaRepositoryPort repository;
    private final CategoriaImageStoragePort imageStorage;

    public CategoriaService(
            CategoriaRepositoryPort repository,
            CategoriaImageStoragePort imageStorage) {
        this.repository = repository;
        this.imageStorage = imageStorage;
    }

    public List<Categoria> getAllCategorias() {
        return repository.findAll();
    }

    public Optional<Categoria> getCategoriaById(Long id) {
        return repository.findById(id);
    }

    public Categoria saveCategoria(Categoria categoria) {

        if (repository.existsByName(
                categoria.getName(),
                categoria.getParentId())) {

            throw new IllegalArgumentException(
                    "Ya existe una categoría con ese nombre");
        }

        return repository.save(categoria);
    }

    public Categoria createCategoria(
            String name,
            String description,
            Long parentId,
            MultipartFile image) {

        Categoria categoria = new Categoria(
                null,
                parentId,
                name,
                description,
                true
        );

        if (repository.existsByName(name, parentId)) {
            throw new IllegalArgumentException(
                    "Ya existe una categoría con ese nombre");
        }

        Categoria saved = repository.save(categoria);

        if (image != null && !image.isEmpty()) {
            String imageUrl = imageStorage.save(saved.getId(), image);

            saved = new Categoria(
                    saved.getId(),
                    saved.getParentId(),
                    saved.getName(),
                    saved.getDescription(),
                    saved.isActive(),
                    imageUrl
            );

            saved = repository.save(saved);
        }

        return saved;
    }

    public Categoria updateCategoria(
            Long id,
            String name,
            String description,
            Long parentId,
            MultipartFile image) {

        Categoria existing = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "La categoría no existe"));

        if (repository.existsByName(name, parentId)
                && (!existing.getName().equalsIgnoreCase(name)
                || !java.util.Objects.equals(
                        existing.getParentId(), parentId))) {

            throw new IllegalArgumentException(
                    "Ya existe una categoría con ese nombre");
        }

        String imageUrl = existing.getImageUrl();

        if (image != null && !image.isEmpty()) {
            imageUrl = imageStorage.save(id, image);
        }

        Categoria updated = new Categoria(
                id,
                parentId,
                name,
                description,
                existing.isActive(),
                imageUrl
        );

        return repository.save(updated);
    }

    public void updateCategoriaStatus(Long id, boolean active) {

        if (repository.findById(id).isEmpty()) {
            throw new IllegalArgumentException(
                    "La categoría no existe");
        }

        repository.updateStatus(id, active);
    }

    public void deleteCategoria(Long id) {

        Categoria categoria = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "La categoría no existe"));

        if (repository.hasProducts(id)) {
            throw new IllegalArgumentException(
                    "No se puede eliminar: la categoría tiene productos asociados");
        }

        if (repository.hasSubcategories(id)) {
            throw new IllegalArgumentException(
                    "No se puede eliminar: la categoría tiene subcategorías");
        }

        repository.deleteById(id);

        imageStorage.delete(categoria.getImageUrl());
    }
}
