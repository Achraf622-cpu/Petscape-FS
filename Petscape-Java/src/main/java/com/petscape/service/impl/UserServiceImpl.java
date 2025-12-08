package com.petscape.service.impl;

import com.petscape.dto.ChangePasswordRequest;
import com.petscape.dto.UpdateProfileRequest;
import com.petscape.dto.UserResponse;
import com.petscape.entity.User;
import com.petscape.exception.BadRequestException;
import com.petscape.mapper.UserMapper;
import com.petscape.repository.UserRepository;
import com.petscape.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Override
    public UserResponse getProfile(User currentUser) {
        return userMapper.toResponse(currentUser);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest request, User currentUser) {
        if (!request.getEmail().equals(currentUser.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already in use by another account");
        }
        currentUser.setFirstname(request.getFirstname());
        currentUser.setLastname(request.getLastname());
        currentUser.setPhone(request.getPhone());
        if (!request.getEmail().equals(currentUser.getEmail())) {
            currentUser.setEmail(request.getEmail());
            currentUser.setEmailVerifiedAt(null);
        }
        return userMapper.toResponse(userRepository.save(currentUser));
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request, User currentUser) {
        if (!passwordEncoder.matches(request.getCurrentPassword(), currentUser.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        if (!request.getNewPassword().equals(request.getNewPasswordConfirmation())) {
            throw new BadRequestException("New passwords do not match");
        }
        currentUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(currentUser);
    }

    @Override
    @Transactional
    public void deleteAccount(User currentUser, String password) {
        if (!passwordEncoder.matches(password, currentUser.getPassword())) {
            throw new BadRequestException("Password is incorrect");
        }
        userRepository.delete(currentUser);
    }
}
