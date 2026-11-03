
package com.boomnails.domain.port.out;

import org.springframework.web.multipart.MultipartFile;

public interface ProductImageStoragePort {

    String save(Long productId, MultipartFile file);
}

