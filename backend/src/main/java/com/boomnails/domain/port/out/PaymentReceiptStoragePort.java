
package com.boomnails.domain.port.out;

import org.springframework.web.multipart.MultipartFile;

public interface PaymentReceiptStoragePort {

    String save(Long orderId, MultipartFile file);

    void delete(String filePath);
}
