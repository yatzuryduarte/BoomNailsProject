
package com.boomnails.domain.port.in;

import com.boomnails.domain.model.Order;

public interface CreateOrderUseCase {

    Long create(Order order);

}
