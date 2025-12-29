package com.petscape.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.petscape.dto.AnimalResponse;
import com.petscape.entity.Animal.AnimalStatus;
import com.petscape.service.IAnimalService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.*;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AnimalController.class)
@Import(com.petscape.config.SecurityTestConfig.class)
@DisplayName("AnimalController Integration Tests (MockMvc)")
class AnimalControllerTest {

        @Autowired
        private MockMvc mockMvc;
        @Autowired
        private ObjectMapper objectMapper;
        @MockBean
        private IAnimalService animalService;

        @Test
        @DisplayName("GET /api/animals — 200 OK with paged list")
        void listAnimals_returns200() throws Exception {
                AnimalResponse dto = AnimalResponse.builder()
                                .id(1L).name("Buddy").breed("Labrador")
                                .status(AnimalStatus.AVAILABLE).build();
                Page<AnimalResponse> page = new PageImpl<>(List.of(dto));

                when(animalService.getAll(any(), any(), any(), any(Pageable.class))).thenReturn(page);

                mockMvc.perform(get("/api/animals"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.content[0].name").value("Buddy"))
                                .andExpect(jsonPath("$.content[0].status").value("AVAILABLE"));
        }

        @Test
        @DisplayName("GET /api/animals/{id} — 200 OK returns animal details")
        void getAnimal_returns200() throws Exception {
                AnimalResponse dto = AnimalResponse.builder()
                                .id(1L).name("Buddy").breed("Labrador")
                                .status(AnimalStatus.AVAILABLE).build();

                when(animalService.getById(1L)).thenReturn(dto);

                mockMvc.perform(get("/api/animals/1"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value(1))
                                .andExpect(jsonPath("$.name").value("Buddy"));
        }

        @Test
        @DisplayName("GET /api/animals/{id} — 404 when not found")
        void getAnimal_notFound_returns404() throws Exception {
                when(animalService.getById(999L))
                                .thenThrow(new com.petscape.exception.ResourceNotFoundException(
                                                "Animal not found with id: 999"));

                mockMvc.perform(get("/api/animals/999"))
                                .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("GET /api/animals/adoption — 200 OK with adopted count")
        void adoptionPage_returns200() throws Exception {
                AnimalResponse dto = AnimalResponse.builder().id(1L).name("Buddy")
                                .status(AnimalStatus.AVAILABLE).build();
                Page<AnimalResponse> page = new PageImpl<>(List.of(dto));

                when(animalService.getAvailableForAdoption(any(), any(), any(), any(Pageable.class))).thenReturn(page);
                when(animalService.getAdoptedCount()).thenReturn(42L);

                mockMvc.perform(get("/api/animals/adoption"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.adoptedCount").value(42));
        }
}
