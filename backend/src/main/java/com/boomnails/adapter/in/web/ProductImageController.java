
package com.boomnails.adapter.in.web;

import com.boomnails.domain.port.in.UploadProductImageUseCase;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/productos")
public class ProductImageController {

    private final UploadProductImageUseCase uploadProductImageUseCase;

    public ProductImageController(
            UploadProductImageUseCase uploadProductImageUseCase) {
        this.uploadProductImageUseCase = uploadProductImageUseCase;
    }

    @PostMapping(
        value = "/{id}/imagenes",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam("alternativeText") String alternativeText,
            @RequestParam(defaultValue = "false") boolean primary) {

        String imagePath = uploadProductImageUseCase.upload(
                id,
                file,
                alternativeText,
                primary
        );

        return Map.of(
                "message", "Imagen guardada correctamente",
                "imageUrl", imagePath
        );
    }
}
