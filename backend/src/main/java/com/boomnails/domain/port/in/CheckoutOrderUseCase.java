
package com.boomnails.domain.port.in;

import com.boomnails.domain.model.Order;
import org.springframework.web.multipart.MultipartFile;

public interface CheckoutOrderUseCase {

    Long checkout(Order order, MultipartFile receipt);
}
