
package com.boomnails.domain.port.out;

import java.math.BigDecimal;

public interface OrderTotalRepositoryPort {

    BigDecimal findTotalByOrderId(Long orderId);
}

