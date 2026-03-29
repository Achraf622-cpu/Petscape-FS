package com.petscape.service;

import com.petscape.dto.AnimalRequest;
import com.petscape.dto.AnimalResponse;
import com.petscape.entity.Animal;
import com.petscape.entity.Species;
import com.petscape.exception.ResourceNotFoundException;
import com.petscape.mapper.AnimalMapper;
import com.petscape.repository.AnimalRepository;

import com.petscape.service.impl.AnimalServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AnimalServiceImpl Unit Tests")
class AnimalServiceImplTest {

    @Mock
    private AnimalRepository animalRepository;
    @Mock
    private IFileStorageService fileStorageService;
    @Mock
    private AnimalMapper animalMapper;
    @InjectMocks
    private AnimalServiceImpl animalService;

    @Test
    @DisplayName("getById() — returns response for existing animal")
    void getById_found_returnsResponse() {
        Animal animal = new Animal();
        animal.setId(1L);
        animal.setName("Buddy");
        AnimalResponse dto = AnimalResponse.builder().id(1L).name("Buddy").build();

        when(animalRepository.findById(1L)).thenReturn(Optional.of(animal));
        when(animalMapper.toResponse(animal)).thenReturn(dto);

        AnimalResponse result = animalService.getById(1L);
        assertThat(result.getName()).isEqualTo("Buddy");
    }

    @Test
    @DisplayName("getById() — throws ResourceNotFoundException for missing animal")
    void getById_notFound_throws() {
        when(animalRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> animalService.getById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    @DisplayName("getAll() — returns paged results")
    @SuppressWarnings("unchecked")
    void getAll_returnsPage() {
        Animal a = new Animal();
        a.setId(1L);
        AnimalResponse dto = AnimalResponse.builder().id(1L).build();
        Page<Animal> page = new PageImpl<>(List.of(a));
        Pageable pageable = PageRequest.of(0, 10);

        when(animalRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);
        when(animalMapper.toResponse(a)).thenReturn(dto);

        Page<AnimalResponse> result = animalService.getAll((com.petscape.entity.Species) null, null, null, pageable);
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("create() — saves animal and returns response")
    void create_success() {
        AnimalRequest request = new AnimalRequest();
        request.setName("Luna");
        request.setSpecies(Species.DOG);
        request.setBreed("Labrador");
        request.setStatus(Animal.AnimalStatus.AVAILABLE);

        Animal animal = new Animal();
        animal.setId(2L);
        animal.setName("Luna");
        AnimalResponse dto = AnimalResponse.builder().id(2L).name("Luna").build();

        when(animalMapper.toEntity(request)).thenReturn(animal);
        when(animalRepository.save(animal)).thenReturn(animal);
        when(animalMapper.toResponse(animal)).thenReturn(dto);

        AnimalResponse result = animalService.create(request);
        assertThat(result.getName()).isEqualTo("Luna");
        verify(animalRepository).save(animal);
    }



    @Test
    @DisplayName("delete() — deletes animal and its images")
    void delete_success() {
        Animal animal = new Animal();
        animal.setId(1L);
        animal.getImages().add("animals/img.jpg");
        when(animalRepository.findById(1L)).thenReturn(Optional.of(animal));

        animalService.delete(1L);

        verify(fileStorageService).delete("animals/img.jpg");
        verify(animalRepository).delete(animal);
    }
}
