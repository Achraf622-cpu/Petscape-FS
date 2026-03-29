package com.petscape.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;


@Configuration
public class OpenApiConfig {

        private static final String BEARER_AUTH = "bearerAuth";

        @Value("${app.base-url:http://localhost:8080}")
        private String baseUrl;

        @Bean
        public OpenAPI petscapeOpenAPI() {
                return new OpenAPI()
                                .info(apiInfo())
                                .servers(List.of(
                                                new Server().url(baseUrl).description("Current environment"),
                                                new Server().url("http://localhost:8080")
                                                                .description("Local development")))
                                .addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH))
                                .components(new Components()
                                                .addSecuritySchemes(BEARER_AUTH, new SecurityScheme()
                                                                .name(BEARER_AUTH)
                                                                .type(SecurityScheme.Type.HTTP)
                                                                .scheme("bearer")
                                                                .bearerFormat("JWT")
                                                                .description("Paste your JWT access token here (obtained from POST /api/auth/login)")));
        }

        private Info apiInfo() {
                return new Info()
                                .title("PetsCape REST API")
                                .version("1.0.0")
                                .description("""
                                                ## PetsCape — Pet Adoption & Lost/Found Platform

                                                A Spring Boot REST API migrated from Laravel, following SOLID principles:

                                                - **DIP** — All controllers inject service *interfaces*, not implementations
                                                - **SRP** — MapStruct handles all entity↔DTO mapping
                                                - **OCP** — JPA Specification classes for extensible filtering

                                                ### Authentication
                                                1. `POST /api/auth/register` or `POST /api/auth/login`
                                                2. Copy the `token` from the response
                                                3. Click **Authorize** above and paste: `<your-token>`
                                                """)
                                .contact(new Contact()
                                                .name("PetsCape Dev Team")
                                                .email("dev@petscape.com"))
                                .license(new License()
                                                .name("MIT License")
                                                .url("https://opensource.org/licenses/MIT"));
        }
}
