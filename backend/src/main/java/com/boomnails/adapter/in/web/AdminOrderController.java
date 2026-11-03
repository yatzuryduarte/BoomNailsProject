package com.boomnails.adapter.in.web;

import com.boomnails.application.service.GetAdminOrdersService;
import com.boomnails.application.service.UpdateAdminOrderStatusService;
import com.boomnails.domain.model.AdminOrder;
import com.boomnails.domain.model.AdminOrderItem;
import com.boomnails.domain.model.OrderStatusUpdate;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final GetAdminOrdersService service;
    private final UpdateAdminOrderStatusService updateService;

    public AdminOrderController(
            GetAdminOrdersService service,
            UpdateAdminOrderStatusService updateService
    ) {
        this.service = service;
        this.updateService = updateService;
    }

    @GetMapping
    public List<AdminOrder> getAllOrders() {
        return service.getAllOrders();
    }

    @GetMapping("/{orderId}/items")
    public List<AdminOrderItem> getOrderItems(
            @PathVariable Long orderId
    ) {
        return service.getItemsByOrderId(orderId);
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<Void> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody OrderStatusUpdate update
    ) {
        updateService.updateOrderStatus(orderId, update);
        return ResponseEntity.noContent().build();
    }
}