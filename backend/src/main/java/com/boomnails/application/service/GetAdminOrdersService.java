package com.boomnails.application.service;

import com.boomnails.domain.model.AdminOrder;
import com.boomnails.domain.model.AdminOrderItem;
import com.boomnails.domain.port.out.AdminOrderRepositoryPort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GetAdminOrdersService {

    private final AdminOrderRepositoryPort repository;

    public GetAdminOrdersService(AdminOrderRepositoryPort repository) {
        this.repository = repository;
    }

    public List<AdminOrder> getAllOrders() {
        return repository.findAllOrders();
    }

    public List<AdminOrderItem> getItemsByOrderId(Long orderId) {
        return repository.findItemsByOrderId(orderId);
    }
}