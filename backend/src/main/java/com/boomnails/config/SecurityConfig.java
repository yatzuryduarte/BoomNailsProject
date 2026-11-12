package com.boomnails.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {

        JwtGrantedAuthoritiesConverter authoritiesConverter =
                new JwtGrantedAuthoritiesConverter();

        // El JWT contiene el rol en el claim "role"
        authoritiesConverter.setAuthoritiesClaimName("role");

        // El claim ya contiene "ROLE_ADMIN"
        authoritiesConverter.setAuthorityPrefix("");

        JwtAuthenticationConverter converter =
                new JwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(
                authoritiesConverter
        );

        return converter;
    }


    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
            .cors(cors -> {})
            .csrf(AbstractHttpConfigurer::disable)

            // No usamos sesiones. La autenticación será mediante JWT.
            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            .authorizeHttpRequests(auth -> auth

                // =========================
                // AUTENTICACIÓN
                // =========================

                .requestMatchers(
                    "/api/auth/login"
                ).permitAll()


                // =========================
                // PRODUCTOS
                // =========================

                // Cualquiera puede consultar productos
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/productos/**"
                ).permitAll()

                // Cualquiera puede consultar categorías
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/categories/**"
                ).permitAll()

                // Solo ADMIN puede crear
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/productos/**"
                ).hasRole("ADMIN")

                // Solo ADMIN puede modificar
                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/productos/**"
                ).hasRole("ADMIN")

                // Solo ADMIN puede eliminar
                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/productos/**"
                ).hasRole("ADMIN")


                // =========================
                // ADMIN
                // =========================

                .requestMatchers(
                    "/api/admin/**"
                ).hasRole("ADMIN")


                // =========================
                // CHECKOUT / PEDIDOS
                // =========================

                .requestMatchers(
                    "/api/checkout/**"
                ).permitAll()

                .requestMatchers(
                    "/api/pedidos/**"
                ).permitAll()


                // =========================
                // COMPROBANTES
                // =========================

                .requestMatchers(
                    "/uploads/comprobantes/**"
                ).hasRole("ADMIN")


                // =========================
                // IMÁGENES DE PRODUCTOS
                // =========================

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/product-images/**"
                ).permitAll()

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/product-images/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/product-images/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/product-images/**"
                ).hasRole("ADMIN")

                // =========================
                // IMÁGENES DE CATEGORÍAS
                // =========================

                .requestMatchers(
                    HttpMethod.GET,
                    "/uploads/categorias/**"
                ).permitAll()

                // =========================
                // IMÁGENES DE PRODUCTOS
                // =========================

                .requestMatchers(
                    HttpMethod.GET,
                    "/uploads/productos/**"
                ).permitAll()


                // =========================
                // TODO LO DEMÁS
                // =========================

                .anyRequest().authenticated()
            )

            // =========================
            // JWT / BEARER TOKEN
            // =========================

            .oauth2ResourceServer(oauth2 ->
                oauth2.jwt(jwt ->
                    jwt.jwtAuthenticationConverter(
                        jwtAuthenticationConverter()
                    )
                )
            );

        return http.build();
    }
}
