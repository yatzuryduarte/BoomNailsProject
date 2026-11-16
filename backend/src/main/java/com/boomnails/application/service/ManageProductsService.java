package com.boomnails.application.service;

import com.boomnails.domain.model.CreateProductCommand;
import com.boomnails.domain.model.Product;
import com.boomnails.domain.model.UpdateProductCommand;
import com.boomnails.domain.port.in.ManageProductsUseCase;
import com.boomnails.domain.port.out.ProductRepositoryPort;

import java.util.List;
import java.util.Optional;

public class ManageProductsService implements ManageProductsUseCase {

    private final ProductRepositoryPort productRepositoryPort;

    public ManageProductsService(
            ProductRepositoryPort productRepositoryPort) {

        this.productRepositoryPort = productRepositoryPort;
    }

    @Override
    public List<Product> getAllProducts() {
        return productRepositoryPort.findAll();
    }

    @Override
    public Optional<Product> getProductById(Long id) {

        validateId(id);

        return productRepositoryPort.findByIdForAdmin(id);
    }

    @Override
    public Long createProduct(CreateProductCommand command) {

        if (command == null) {
            throw new IllegalArgumentException("La información del producto es obligatoria");
        }

        if (command.categoryId() == null || command.categoryId() <= 0) {
            throw new IllegalArgumentException("La categoría es obligatoria");
        }

        if (command.reference() == null || command.reference().isBlank()) {
            throw new IllegalArgumentException("La referencia es obligatoria");
        }

        if (command.name() == null || command.name().isBlank()) {
            throw new IllegalArgumentException("El nombre del producto es obligatorio");
        }

        if (command.presentations() == null || command.presentations().isEmpty()) {
            throw new IllegalArgumentException(
                    "El producto debe tener al menos una presentación"
            );
        }

        if (productRepositoryPort.existsByReference(command.reference().trim())) {
            throw new IllegalArgumentException(
                    "Ya existe un producto con la referencia: " + command.reference()
            );
        }

        validatePresentations(command.presentations());

        // La persistencia del comando se implementará en el repositorio
        // para generar primero el ID del producto y posteriormente
        // registrar sus presentaciones.
        return productRepositoryPort.save(command);

    }

    private void validatePresentations(
        List<CreateProductCommand.PresentationCommand> presentations) {

    for (CreateProductCommand.PresentationCommand presentation : presentations) {

        if (presentation == null) {
            throw new IllegalArgumentException(
                    "La presentación no puede ser nula"
            );
        }

        if (presentation.name() == null || presentation.name().isBlank()) {
            throw new IllegalArgumentException(
                    "El nombre de la presentación es obligatorio"
            );
        }

        boolean hasVolume = presentation.volumeMl() != null;
        boolean hasUnits = presentation.unitsPerPackage() != null;

        if (hasVolume == hasUnits) {
            throw new IllegalArgumentException(
                    "La presentación debe tener volumen en ml o cantidad por paquete, pero no ambos"
            );
        }

        if (hasVolume && presentation.volumeMl() <= 0) {
            throw new IllegalArgumentException(
                    "El volumen debe ser mayor que cero"
            );
        }

        if (hasUnits && presentation.unitsPerPackage() <= 0) {
            throw new IllegalArgumentException(
                    "La cantidad por paquete debe ser mayor que cero"
            );
        }

        if (presentation.retailPrice() != null
                && presentation.retailPrice().signum() < 0) {
            throw new IllegalArgumentException(
                    "El precio al detal no puede ser negativo"
            );
        }

        if (presentation.wholesalePrice() != null
                && presentation.wholesalePrice().signum() < 0) {
            throw new IllegalArgumentException(
                    "El precio al por mayor no puede ser negativo"
            );
        }
    }
}

private void validateUpdatePresentations(
        List<UpdateProductCommand.PresentationCommand> presentations) {

        for (UpdateProductCommand.PresentationCommand presentation
                : presentations) {

            if (presentation == null) {
                throw new IllegalArgumentException(
                        "La presentación no puede ser nula"
                );
            }

            if (presentation.id() != null && presentation.id() <= 0) {
                throw new IllegalArgumentException(
                        "El ID de la presentación debe ser válido"
                );
            }

            if (presentation.name() == null
                    || presentation.name().isBlank()) {

                throw new IllegalArgumentException(
                        "El nombre de la presentación es obligatorio"
                );
            }

            boolean hasVolume = presentation.volumeMl() != null;
            boolean hasUnits = presentation.unitsPerPackage() != null;

            if (hasVolume == hasUnits) {
                throw new IllegalArgumentException(
                        "La presentación debe tener volumen en ml "
                                + "o cantidad por paquete, pero no ambos"
                );
            }

            if (hasVolume && presentation.volumeMl() <= 0) {
                throw new IllegalArgumentException(
                        "El volumen debe ser mayor que cero"
                );
            }

            if (hasUnits && presentation.unitsPerPackage() <= 0) {
                throw new IllegalArgumentException(
                        "La cantidad por paquete debe ser mayor que cero"
                );
            }

            if (presentation.retailPrice() != null
                    && presentation.retailPrice().signum() < 0) {

                throw new IllegalArgumentException(
                        "El precio al detal no puede ser negativo"
                );
            }

            if (presentation.wholesalePrice() != null
                    && presentation.wholesalePrice().signum() < 0) {

                throw new IllegalArgumentException(
                        "El precio al por mayor no puede ser negativo"
                );
            }
        }
    }

    @Override
    public void updateProduct(UpdateProductCommand command) {

        if (command == null) {
            throw new IllegalArgumentException(
                    "La información del producto es obligatoria"
            );
        }

        validateId(command.id());

        if (command.categoryId() == null || command.categoryId() <= 0) {
            throw new IllegalArgumentException(
                    "La categoría es obligatoria"
            );
        }

        if (command.reference() == null || command.reference().isBlank()) {
            throw new IllegalArgumentException(
                    "La referencia es obligatoria"
            );
        }

        if (command.name() == null || command.name().isBlank()) {
            throw new IllegalArgumentException(
                    "El nombre del producto es obligatorio"
            );
        }

        if (command.presentations() == null
                || command.presentations().isEmpty()) {

            throw new IllegalArgumentException(
                    "El producto debe tener al menos una presentación"
            );
        }

        String reference = command.reference().trim();

        if (productRepositoryPort.existsByReferenceExcludingId(
                reference,
                command.id())) {

            throw new IllegalArgumentException(
                    "Ya existe otro producto con la referencia: " + reference
            );
        }

        if (productRepositoryPort.findByIdForAdmin(command.id()).isEmpty()) {
            throw new IllegalArgumentException(
                    "El producto no existe"
            );
        }

        validateUpdatePresentations(command.presentations());

        productRepositoryPort.update(command);
    }

    @Override
    public void updateProductStatus(
            Long id,
            boolean active) {

        validateId(id);

        Optional<Product> existingProduct =
                productRepositoryPort.findByIdForAdmin(id);

        if (existingProduct.isEmpty()) {
            throw new IllegalArgumentException(
                    "El producto no existe"
            );
        }

        productRepositoryPort.updateStatus(id, active);
    }

    @Override
    public void deleteProduct(Long id) {

        validateId(id);

        Optional<Product> existingProduct =
                productRepositoryPort.findByIdForAdmin(id);

        if (existingProduct.isEmpty()) {
            throw new IllegalArgumentException(
                    "El producto no existe"
            );
        }

        productRepositoryPort.deleteById(id);
    }

    private void validateId(Long id) {

        if (id == null || id <= 0) {
            throw new IllegalArgumentException(
                    "El identificador del producto no es válido"
            );
        }
    }

    private void validateProduct(Product product) {

        if (product == null) {
            throw new IllegalArgumentException(
                    "El producto es obligatorio"
            );
        }

        if (product.getCategoryId() == null
                || product.getCategoryId() <= 0) {

            throw new IllegalArgumentException(
                    "La categoría del producto es obligatoria"
            );
        }

        if (product.getReference() == null
                || product.getReference().isBlank()) {

            throw new IllegalArgumentException(
                    "La referencia del producto es obligatoria"
            );
        }

        if (product.getName() == null
                || product.getName().isBlank()) {

            throw new IllegalArgumentException(
                    "El nombre del producto es obligatorio"
            );
        }
    }
}