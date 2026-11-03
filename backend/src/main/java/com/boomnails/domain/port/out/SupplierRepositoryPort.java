package com.boomnails.domain.port.out;

import com.boomnails.domain.model.Supplier;
import java.util.List;
import java.util.Optional;

public interface SupplierRepositoryPort {

    List<Supplier> findAllActive();
    List<Supplier> findAll();

    Supplier save(Supplier supplier);

    Optional<Supplier> update(Long id, Supplier supplier);

    boolean updateStatus(Long id, String status);
}