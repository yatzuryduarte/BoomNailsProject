
package com.boomnails.security;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class DatabaseUserDetailsService implements UserDetailsService {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseUserDetailsService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        var users = jdbcTemplate.query("""
            SELECT correo, password_hash, rol, estado
            FROM usuario
            WHERE correo = ?
            """,
            (rs, rowNum) -> User.withUsername(rs.getString("correo"))
                .password(rs.getString("password_hash"))
                .roles(rs.getString("rol"))
                .disabled(!"ACTIVO".equals(rs.getString("estado")))
                .build(),
            username
        );

        if (users.isEmpty()) {
            throw new UsernameNotFoundException(
                "Usuario no encontrado."
            );
        }

        return users.get(0);
    }
}
