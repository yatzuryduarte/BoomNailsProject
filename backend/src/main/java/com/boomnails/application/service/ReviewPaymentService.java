
package com.boomnails.application.service;

import com.boomnails.domain.port.out.PaymentReviewRepositoryPort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReviewPaymentService {

    private final PaymentReviewRepositoryPort paymentReviewRepository;

    public ReviewPaymentService(
            PaymentReviewRepositoryPort paymentReviewRepository
    ) {
        this.paymentReviewRepository = paymentReviewRepository;
    }

    @Transactional
    public void approve(Long paymentId, Long adminUserId) {
        paymentReviewRepository.approvePayment(paymentId, adminUserId);
    }

    @Transactional
    public void reject(
            Long paymentId,
            Long adminUserId,
            String reason
    ) {
        paymentReviewRepository.rejectPayment(
                paymentId,
                adminUserId,
                reason
        );
    }
}
