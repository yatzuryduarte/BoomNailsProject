
package com.boomnails.adapter.in.web;

import com.boomnails.domain.model.Order;
import com.boomnails.domain.port.in.CheckoutOrderUseCase;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {

    private final CheckoutOrderUseCase checkoutOrderUseCase;
    private final ObjectMapper objectMapper;

    public CheckoutController(
            CheckoutOrderUseCase checkoutOrderUseCase,
            ObjectMapper objectMapper) {
        this.checkoutOrderUseCase = checkoutOrderUseCase;
        this.objectMapper = objectMapper;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> checkout(
            @RequestPart("order") String orderJson,
            @RequestPart("receipt") MultipartFile receipt) {

        try {
            Order order = objectMapper.readValue(orderJson, Order.class);
            Long orderId = checkoutOrderUseCase.checkout(order, receipt);

            return Map.of(
                    "message", "Pedido registrado y comprobante recibido",
                    "orderId", orderId
            );
        } catch (IOException exception) {
            throw new IllegalArgumentException(
                    "No fue posible leer los datos del pedido.");
        }
    }
}
