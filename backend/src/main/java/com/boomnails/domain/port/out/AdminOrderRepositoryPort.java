package com.boomnails.domain.port.out;

import com.boomnails.domain.model.AdminOrder;
import com.boomnails.domain.model.AdminOrderItem;

import java.util.List;

public interface AdminOrderRepositoryPort {

    List<AdminOrder> findAllOrders();

    List<AdminOrderItem> findItemsByOrderId(Long orderId);

        void updateOrderStatus(
        Long orderId,
        String status,
        String carrier,
        String trackingNumber
    );
}