package com.boomnails.application.service;

import com.boomnails.domain.model.WeeklySale;
import com.boomnails.domain.port.out.WeeklySalesRepositoryPort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GetWeeklySalesService {

    private final WeeklySalesRepositoryPort repository;

    public GetWeeklySalesService(WeeklySalesRepositoryPort repository) {
        this.repository = repository;
    }

    public List<WeeklySale> getWeeklySales() {
        return repository.findWeeklySales();
    }
}