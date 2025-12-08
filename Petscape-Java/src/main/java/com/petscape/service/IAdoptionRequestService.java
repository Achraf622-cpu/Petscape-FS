package com.petscape.service;

import com.petscape.dto.AdoptionRequestResponse;
import com.petscape.entity.AdoptionRequest.AdoptionStatus;
import com.petscape.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IAdoptionRequestService {
    AdoptionRequestResponse store(Long animalId, String message, User currentUser);

    void cancel(Long id, User currentUser);

    AdoptionRequestResponse updateStatus(Long id, AdoptionStatus newStatus);

    List<AdoptionRequestResponse> getPending();

    Page<AdoptionRequestResponse> getMyRequests(Long userId, Pageable pageable);

    AdoptionRequestResponse getById(Long id, User currentUser);
}
