package com.boomnails.domain.port.out;

import com.boomnails.domain.model.WeeklySale;
import java.util.List;

public interface WeeklySalesRepositoryPort {

    List<WeeklySale> findWeeklySales();
}
