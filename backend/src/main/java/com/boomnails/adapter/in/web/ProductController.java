
package com.boomnails.adapter.in.web;

import com.boomnails.domain.model.Product;
import com.boomnails.domain.port.in.GetProductsUseCase;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductController {

    private final GetProductsUseCase getProductsUseCase;

    public ProductController(GetProductsUseCase getProductsUseCase) {
        this.getProductsUseCase = getProductsUseCase;
    }

    @GetMapping
    public List<Product> getProducts() {
        return getProductsUseCase.getAllActiveProducts();
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return getProductsUseCase.getProductById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Producto no encontrado"
                ));
    }
}

