package com.boomnails.adapter.in.web;

import com.boomnails.application.service.CategoriaService;
import com.boomnails.domain.model.Categoria;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175"
})
public class PublicCategoryController {

    private final CategoriaService service;

    public PublicCategoryController(CategoriaService service) {
        this.service = service;
    }

    @GetMapping
    public List<Categoria> getActiveCategories() {
        return service.getAllCategorias()
            .stream()
            .filter(Categoria::isActive)
            .toList();  
    }
}