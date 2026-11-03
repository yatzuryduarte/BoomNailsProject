package com.boomnails.domain.port.out;

import org.springframework.web.multipart.MultipartFile;

public interface CategoriaImageStoragePort {

    String save(Long categoryId, MultipartFile file);
    void delete(String imageUrl);
}