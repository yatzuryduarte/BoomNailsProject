package com.boomnails.adapter.in.web;

import com.boomnails.application.service.GetWeeklySalesService;
import com.boomnails.domain.model.WeeklySale;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
public class WeeklySalesController {

    private final GetWeeklySalesService service;

    public WeeklySalesController(GetWeeklySalesService service) {
        this.service = service;
    }

    @GetMapping("/weekly-sales")
    public List<WeeklySale> getWeeklySales() {
        return service.getWeeklySales();
    }
}
