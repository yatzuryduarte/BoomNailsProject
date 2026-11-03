package com.boomnails.adapter.in.web;

import com.boomnails.application.service.GetTopSellingProductsService;
import com.boomnails.domain.model.TopSellingProduct;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
public class TopSellingProductController {

    private final GetTopSellingProductsService service;

    public TopSellingProductController(
            GetTopSellingProductsService service
    ) {
        this.service = service;
    }

    @GetMapping("/top-selling-products")
    public List<TopSellingProduct> getTopSellingProducts() {
        return service.getTopSellingProducts();
    }
}
