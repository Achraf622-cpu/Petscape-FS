package com.petscape.config;

import com.petscape.entity.Species;
import com.petscape.entity.User;
import com.petscape.repository.SpeciesRepository;
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
    private final SpeciesRepository speciesRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            seedAdmin();
            seedSpecies();
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

    private void seedSpecies() {
        if (speciesRepository.count() > 0) {
            log.info("Species already seeded ({} found).", speciesRepository.count());
            return;
        }

        List<Species> species = List.of(
                Species.builder().name("Dog").description("Domestic dogs of all breeds").build(),
                Species.builder().name("Cat").description("Domestic cats of all breeds").build(),
                Species.builder().name("Bird").description("Pet birds including parrots, canaries, and finches")
                        .build(),
                Species.builder().name("Rabbit").description("Domestic rabbits").build(),
                Species.builder().name("Hamster").description("Small rodent pets").build(),
                Species.builder().name("Fish").description("Aquarium and ornamental fish").build(),
                Species.builder().name("Turtle").description("Pet turtles and tortoises").build(),
                Species.builder().name("Other").description("Other animal species").build());
        speciesRepository.saveAll(species);
        log.info("Seeded {} default species.", species.size());
    }
}
