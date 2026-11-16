package com.boomnails.adapter.in.web.dto;

import java.math.BigDecimal;
import java.util.List;

public record CreateProductRequest(

        Long categoryId,

        String reference,

        String name,

        String description,

        List<PresentationRequest> presentations

) {

    public record PresentationRequest(

            String name,

            Integer volumeMl,

            Integer unitsPerPackage,

            BigDecimal retailPrice,

            BigDecimal wholesalePrice

    ) {
    }
}