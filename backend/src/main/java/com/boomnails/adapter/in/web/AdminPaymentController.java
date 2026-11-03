
package com.boomnails.adapter.in.web;

import com.boomnails.application.service.GetPendingPaymentsService;
import com.boomnails.domain.port.out.AdminPaymentRepositoryPort.PendingPayment;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/payments")
public class AdminPaymentController {

    private final GetPendingPaymentsService service;

    public AdminPaymentController(GetPendingPaymentsService service) {
        this.service = service;
    }

    @GetMapping("/pending")
    public List<PendingPayment> getPendingPayments() {
        return service.getPendingPayments();
    }
}
