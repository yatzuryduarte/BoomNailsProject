
package com.boomnails.domain.port.in;

import org.springframework.web.multipart.MultipartFile;

public interface UploadProductImageUseCase {

    String upload(
            Long productId,
            MultipartFile file,
            String alternativeText,
            boolean primary
    );
}
