
package com.boomnails.application.service;

import com.boomnails.domain.model.Order;
import com.boomnails.domain.port.in.CreateOrderUseCase;
import com.boomnails.domain.port.out.OrderRepositoryPort;
import org.springframework.stereotype.Service;

@Service
public class CreateOrderService implements CreateOrderUseCase {

    private final OrderRepositoryPort orderRepositoryPort;

    public CreateOrderService(OrderRepositoryPort orderRepositoryPort) {
        this.orderRepositoryPort = orderRepositoryPort;
    }

    @Override
    public Long create(Order order) {
        validateOrder(order);
        return orderRepositoryPort.save(order);
    }

    private void validateOrder(Order order) {
        if (order == null) {
            throw new IllegalArgumentException("El pedido es obligatorio.");
        }

        if (order.customerName() == null || order.customerName().isBlank()) {
            throw new IllegalArgumentException("El nombre del cliente es obligatorio.");
        }

        if (order.customerEmail() == null || order.customerEmail().isBlank()) {
            throw new IllegalArgumentException("El correo del cliente es obligatorio.");
        }

        if (order.customerPhone() == null || order.customerPhone().isBlank()) {
            throw new IllegalArgumentException("El teléfono del cliente es obligatorio.");
        }

        if (order.shippingAddress() == null || order.shippingAddress().isBlank()) {
            throw new IllegalArgumentException("La dirección de entrega es obligatoria.");
        }

        if (order.shippingCity() == null || order.shippingCity().isBlank()) {
            throw new IllegalArgumentException("La ciudad de entrega es obligatoria.");
        }

        if (order.shippingDepartment() == null || order.shippingDepartment().isBlank()) {
            throw new IllegalArgumentException("El departamento es obligatorio.");
        }

        if (order.items() == null || order.items().isEmpty()) {
            throw new IllegalArgumentException("El pedido debe contener al menos un producto.");
        }

        for (Order.OrderItem item : order.items()) {
            if (item == null || item.presentationId() == null || item.presentationId() <= 0) {
                throw new IllegalArgumentException("La presentación del producto no es válida.");
            }

            if (item.quantity() <= 0) {
                throw new IllegalArgumentException("La cantidad debe ser mayor que cero.");
            }
        }
    }
}
