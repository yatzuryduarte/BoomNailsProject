package com.boomnails.domain.port.out;

import com.boomnails.domain.model.TopSellingProduct;
import java.util.List;

public interface TopSellingProductRepositoryPort {

    List<TopSellingProduct> findTopSellingProducts();
}
