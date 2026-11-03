
package com.boomnails.domain.port.out;

import java.util.List;

public interface ProductImageRepositoryPort {

    void saveImage(
            Long productId,
            String imagePath,
            String alternativeText,
            boolean primary
    );

    List<String> findImagePathsByProductId(Long productId);
}
