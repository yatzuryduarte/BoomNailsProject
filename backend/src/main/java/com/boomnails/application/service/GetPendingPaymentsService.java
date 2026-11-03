
package com.boomnails.application.service;

import com.boomnails.domain.port.out.AdminPaymentRepositoryPort;
import com.boomnails.domain.port.out.AdminPaymentRepositoryPort.PendingPayment;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GetPendingPaymentsService {

    private final AdminPaymentRepositoryPort paymentRepository;

    public GetPendingPaymentsService(
            AdminPaymentRepositoryPort paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public List<PendingPayment> getPendingPayments() {
        return paymentRepository.findPendingPayments();
    }
}
