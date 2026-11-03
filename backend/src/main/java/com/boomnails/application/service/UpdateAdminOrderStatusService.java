package com.boomnails.application.service;

import com.boomnails.domain.model.OrderStatusUpdate;
import com.boomnails.domain.port.out.AdminOrderRepositoryPort;
import org.springframework.stereotype.Service;

@Service
public class UpdateAdminOrderStatusService {

    private final AdminOrderRepositoryPort repository;

    public UpdateAdminOrderStatusService(
            AdminOrderRepositoryPort repository
    ) {
        this.repository = repository;
    }

    public void updateOrderStatus(
            Long orderId,
            OrderStatusUpdate update
    ) {
        repository.updateOrderStatus(
            orderId,
            update.status(),
            update.carrier(),
            update.trackingNumber()
        );
    }
}