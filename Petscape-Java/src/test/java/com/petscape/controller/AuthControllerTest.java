package com.petscape.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.petscape.dto.AuthResponse;
import com.petscape.dto.LoginRequest;
import com.petscape.dto.RegisterRequest;
import com.petscape.service.IAuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import(com.petscape.config.SecurityTestConfig.class)
@DisplayName("AuthController Integration Tests (MockMvc)")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @MockBean
    private IAuthService authService;

    @Test
    @DisplayName("POST /api/auth/register — 201 Created with JWT token")
    void register_returns201() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setFirstname("John");
        request.setLastname("Doe");
        request.setEmail("john@example.com");
        request.setPassword("secret123");
        request.setPasswordConfirmation("secret123");

        AuthResponse response = AuthResponse.builder()
                .token("jwt-token").email("john@example.com")
                .firstname("John").lastname("Doe").role("USER").build();

        when(authService.register(any(RegisterRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.email").value("john@example.com"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    @DisplayName("POST /api/auth/login — 200 OK with JWT token")
    void login_returns200() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("john@example.com");
        request.setPassword("secret123");

        AuthResponse response = AuthResponse.builder()
                .token("jwt-token").email("john@example.com")
                .firstname("John").lastname("Doe").role("USER").build();

        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"));
    }
}
