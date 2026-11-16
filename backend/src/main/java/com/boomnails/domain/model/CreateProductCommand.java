package com.boomnails.domain.model;

import java.math.BigDecimal;
import java.util.List;

public record CreateProductCommand(
        Long categoryId,
        String reference,
        String name,
        String description,
        List<PresentationCommand> presentations
) {

    public record PresentationCommand(
            String name,
            Integer volumeMl,
            Integer unitsPerPackage,
            BigDecimal retailPrice,
            BigDecimal wholesalePrice
    ) {
    }
}