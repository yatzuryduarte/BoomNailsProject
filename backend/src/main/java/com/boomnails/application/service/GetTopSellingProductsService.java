package com.boomnails.application.service;

import com.boomnails.domain.model.TopSellingProduct;
import com.boomnails.domain.port.out.TopSellingProductRepositoryPort;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GetTopSellingProductsService {

    private final TopSellingProductRepositoryPort repository;

    public GetTopSellingProductsService(
            TopSellingProductRepositoryPort repository
    ) {
        this.repository = repository;
    }

    public List<TopSellingProduct> getTopSellingProducts() {
        return repository.findTopSellingProducts();
    }
}
