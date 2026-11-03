
package com.boomnails.domain.port.out;

import java.math.BigDecimal;

public interface PaymentRepositoryPort {

    Long savePendingTransfer(Long orderId, BigDecimal amount);

    boolean belongsToOrder(Long paymentId, Long orderId);
}
