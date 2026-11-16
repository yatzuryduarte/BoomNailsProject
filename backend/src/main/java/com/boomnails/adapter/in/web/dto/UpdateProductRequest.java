package com.boomnails.adapter.in.web.dto;

import java.math.BigDecimal;
import java.util.List;

public record UpdateProductRequest(
        Long categoryId,
        String reference,
        String name,
        String description,
        List<PresentationRequest> presentations
) {

    public record PresentationRequest(
            Long id,
            String name,
            Integer volumeMl,
            Integer unitsPerPackage,
            BigDecimal retailPrice,
            BigDecimal wholesalePrice
    ) {}
}
