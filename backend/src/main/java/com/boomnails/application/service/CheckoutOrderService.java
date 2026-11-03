
package com.boomnails.application.service;

import com.boomnails.domain.model.Order;
import com.boomnails.domain.port.in.CheckoutOrderUseCase;
import com.boomnails.domain.port.in.CreateOrderUseCase;
import com.boomnails.domain.port.out.OrderTotalRepositoryPort;
import com.boomnails.domain.port.out.PaymentRepositoryPort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CheckoutOrderService implements CheckoutOrderUseCase {

    private final CreateOrderUseCase createOrderUseCase;
    private final OrderTotalRepositoryPort orderTotalRepositoryPort;
    private final PaymentRepositoryPort paymentRepositoryPort;
    private final UploadPaymentReceiptService uploadPaymentReceiptService;

    public CheckoutOrderService(
            CreateOrderUseCase createOrderUseCase,
            OrderTotalRepositoryPort orderTotalRepositoryPort,
            PaymentRepositoryPort paymentRepositoryPort,
            UploadPaymentReceiptService uploadPaymentReceiptService) {
        this.createOrderUseCase = createOrderUseCase;
        this.orderTotalRepositoryPort = orderTotalRepositoryPort;
        this.paymentRepositoryPort = paymentRepositoryPort;
        this.uploadPaymentReceiptService = uploadPaymentReceiptService;
    }

    @Override
    @Transactional
    public Long checkout(Order order, MultipartFile receipt) {
        if (receipt == null || receipt.isEmpty()) {
            throw new IllegalArgumentException(
                    "Debes adjuntar el comprobante de transferencia.");
        }

        if (order == null) {
            throw new IllegalArgumentException(
                    "Los datos del pedido son obligatorios.");
        }

        Long orderId = createOrderUseCase.create(order);

        var total = orderTotalRepositoryPort.findTotalByOrderId(orderId);

        Long paymentId = paymentRepositoryPort.savePendingTransfer(
                orderId,
                total
        );

        uploadPaymentReceiptService.upload(
                orderId,
                paymentId,
                receipt
        );

        return orderId;
    }
}
