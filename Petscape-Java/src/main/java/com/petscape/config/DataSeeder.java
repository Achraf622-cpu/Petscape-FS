package com.petscape.config;

import com.petscape.entity.User;
import com.petscape.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            seedAdmin();
        };
    }

    private void seedAdmin() {
        String adminEmail = "admin@petscape.com";
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .firstname("Super")
                    .lastname("Admin")
                    .email(adminEmail)
                    .password(passwordEncoder.encode("admin123"))
                    .role(User.Role.ADMIN)
                    .emailVerifiedAt(LocalDateTime.now())
                    .build();
            userRepository.save(admin);
            log.info("Admin account seeded: admin@petscape.com / admin123");
        }
    }
}
