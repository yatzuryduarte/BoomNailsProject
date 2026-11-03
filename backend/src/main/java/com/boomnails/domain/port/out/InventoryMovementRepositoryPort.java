package com.boomnails.domain.port.out;

import java.util.List;
import java.util.Map;

public interface InventoryMovementRepositoryPort {

    List<Map<String, Object>> findAllMovements();
}
