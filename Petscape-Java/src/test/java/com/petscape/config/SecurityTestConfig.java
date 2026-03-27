package com.petscape.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.userdetails.UserDetailsService;
import com.petscape.security.JwtUtil;

/**
 * Permissive security config used only in @WebMvcTest slice tests.
 * Disables CSRF and lets all requests through so tests can focus on
 * controller logic without needing to deal with JWT auth wiring.
 *
 * Both JwtUtil and UserDetailsService must be mocked here because
 * JwtAuthFilter is a @Component that gets picked up by the @WebMvcTest
 * slice and needs both of these dependencies injected.
 */
@TestConfiguration
public class SecurityTestConfig {

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain testSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }
}
