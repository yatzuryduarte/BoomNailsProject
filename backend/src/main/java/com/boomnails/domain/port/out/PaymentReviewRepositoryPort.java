
package com.boomnails.domain.port.out;

public interface PaymentReviewRepositoryPort {

    void approvePayment(Long paymentId, Long adminUserId);

    void rejectPayment(
            Long paymentId,
            Long adminUserId,
            String reason
    );
}
