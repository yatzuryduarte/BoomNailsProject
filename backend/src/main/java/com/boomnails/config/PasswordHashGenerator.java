
package com.boomnails.config;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.io.Console;

public class PasswordHashGenerator {

    public static void main(String[] args) {
        Console console = System.console();

        if (console == null) {
            System.err.println(
                "Ejecuta este programa desde una terminal interactiva."
            );
            return;
        }

        char[] password = console.readPassword(
            "Escribe la contraseña del administrador: "
        );

        try {
            String hash = new BCryptPasswordEncoder()
                .encode(new String(password));

            System.out.println("Hash BCrypt:");
            System.out.println(hash);
        } finally {
            java.util.Arrays.fill(password, '\0');
        }
    }
}
