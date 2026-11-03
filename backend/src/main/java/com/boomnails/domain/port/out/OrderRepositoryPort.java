
package com.boomnails.domain.port.out;

import com.boomnails.domain.model.Order;

public interface OrderRepositoryPort {

    Long save(Order order);

}