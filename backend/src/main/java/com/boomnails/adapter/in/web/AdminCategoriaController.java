
package com.boomnails.adapter.in.web;

import com.boomnails.application.service.CategoriaService;
import com.boomnails.domain.model.Categoria;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/categories")
public class AdminCategoriaController {

    private final CategoriaService service;

    public AdminCategoriaController(CategoriaService service) {
        this.service = service;
    }

    @GetMapping
    public List<Categoria> getAllCategorias() {
        return service.getAllCategorias();
    }

    @GetMapping("/{id}")
    public Categoria getCategoriaById(@PathVariable Long id) {
        return service.getCategoriaById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Categoría no encontrada"));
    }

    @PostMapping(consumes = "multipart/form-data")
    @ResponseStatus(HttpStatus.CREATED)
    public Categoria createCategoria(
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Long parentId,
            @RequestParam(required = false) MultipartFile image) {

        return service.createCategoria(
                name,
                description,
                parentId,
                image
        );
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public Categoria updateCategoria(
            @PathVariable Long id,
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Long parentId,
            @RequestParam(required = false) MultipartFile image) {

        return service.updateCategoria(
                id,
                name,
                description,
                parentId,
                image
        );
    }

    @PatchMapping("/{id}/status")
    public void updateCategoriaStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {

        service.updateCategoriaStatus(id, active);
    }

    @DeleteMapping("/{id}")
    public void deleteCategoria(@PathVariable Long id) {
        service.deleteCategoria(id);
    }
}
