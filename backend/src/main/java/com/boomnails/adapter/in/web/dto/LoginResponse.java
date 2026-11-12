package com.boomnails.adapter.in.web.dto;

public record LoginResponse(
        String token,
        String correo,
        String rol
) {
}
