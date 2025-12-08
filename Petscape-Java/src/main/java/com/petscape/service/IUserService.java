package com.petscape.service;

import com.petscape.dto.ChangePasswordRequest;
import com.petscape.dto.UpdateProfileRequest;
import com.petscape.dto.UserResponse;
import com.petscape.entity.User;

public interface IUserService {
    UserResponse getProfile(User currentUser);

    UserResponse updateProfile(UpdateProfileRequest request, User currentUser);

    void changePassword(ChangePasswordRequest request, User currentUser);

    void deleteAccount(User currentUser, String password);
}
