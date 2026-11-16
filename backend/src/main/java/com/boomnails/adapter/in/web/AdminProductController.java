package com.boomnails.adapter.in.web;

import com.boomnails.domain.model.Product;
import com.boomnails.domain.model.UpdateProductCommand;
import com.boomnails.domain.port.in.ManageProductsUseCase;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.boomnails.adapter.in.web.dto.CreateProductRequest;
import com.boomnails.domain.model.CreateProductCommand;
import com.boomnails.adapter.in.web.dto.UpdateProductRequest;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@RestController
@RequestMapping("/api/admin/productos")
public class AdminProductController {

    private final ManageProductsUseCase manageProductsUseCase;

    public AdminProductController(
            ManageProductsUseCase manageProductsUseCase) {

        this.manageProductsUseCase = manageProductsUseCase;
    }

    @GetMapping
    public List<Product> getAllProducts() {

        return manageProductsUseCase.getAllProducts();
    }

    @GetMapping("/{id}")
    public Product getProductById(
            @PathVariable Long id) {

        return manageProductsUseCase
                .getProductById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Producto no encontrado"
                        )
                );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Long createProduct(@RequestBody CreateProductRequest request) {

        CreateProductCommand command = new CreateProductCommand(
                request.categoryId(),
                request.reference(),
                request.name(),
                request.description(),
                request.presentations()
                        .stream()
                        .map(presentation ->
                                new CreateProductCommand.PresentationCommand(
                                        presentation.name(),
                                        presentation.volumeMl(),
                                        presentation.unitsPerPackage(),
                                        presentation.retailPrice(),
                                        presentation.wholesalePrice()
                                )
                        )
                        .toList()
        );

        return manageProductsUseCase.createProduct(command);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateProduct(
            @PathVariable Long id,
            @RequestBody UpdateProductRequest request) {

        UpdateProductCommand command = new UpdateProductCommand(
                id,
                request.categoryId(),
                request.reference(),
                request.name(),
                request.description(),
                request.presentations().stream()
                        .map(presentation ->
                                new UpdateProductCommand.PresentationCommand(
                                        presentation.id(),
                                        presentation.name(),
                                        presentation.volumeMl(),
                                        presentation.unitsPerPackage(),
                                        presentation.retailPrice(),
                                        presentation.wholesalePrice()
                                )
                        )
                        .toList()
        );

        manageProductsUseCase.updateProduct(command);
    }

    @PatchMapping("/{id}/status")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updateProductStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {

        manageProductsUseCase.updateProductStatus(id, active);
    }
}