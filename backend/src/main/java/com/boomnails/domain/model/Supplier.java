package com.boomnails.domain.model;

public class Supplier {

    private final Long id;
    private final String name;
    private final String identification;
    private final String phone;
    private final String email;
    private final String address;
    private final String notes;
    private final String status;

    public Supplier(
            Long id,
            String name,
            String identification,
            String phone,
            String email,
            String address,
            String notes,
            String status) {

        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException(
                    "El nombre del proveedor es obligatorio");
        }

        this.id = id;
        this.name = name;
        this.identification = identification;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.notes = notes;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getIdentification() {
        return identification;
    }

    public String getPhone() {
        return phone;
    }

    public String getEmail() {
        return email;
    }

    public String getAddress() {
        return address;
    }

    public String getNotes() {
        return notes;
    }

    public String getStatus() {
        return status;
    }
}