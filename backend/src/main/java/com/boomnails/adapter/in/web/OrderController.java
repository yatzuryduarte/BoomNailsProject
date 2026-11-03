
package com.boomnails.adapter.in.web;

import com.boomnails.domain.model.Order;
import com.boomnails.domain.port.in.CreateOrderUseCase;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
public class OrderController {

    private final CreateOrderUseCase createOrderUseCase;

    public OrderController(CreateOrderUseCase createOrderUseCase) {
        this.createOrderUseCase = createOrderUseCase;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> createOrder(@RequestBody Order order) {
        Long orderId = createOrderUseCase.create(order);

        return Map.of(
                "message", "Pedido creado correctamente",
                "orderId", orderId
        );
    }
}
