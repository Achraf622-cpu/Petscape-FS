package com.petscape;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PetscapeApplication {

    public static void main(String[] args) {
        SpringApplication.run(PetscapeApplication.class, args);
    }
}
