package com.boomnails.domain.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public record WeeklySale(
    LocalDate saleDate,
    BigDecimal totalSales
) {}
