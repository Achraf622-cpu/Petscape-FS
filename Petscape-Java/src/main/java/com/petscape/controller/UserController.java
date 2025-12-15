package com.petscape.controller;

import com.petscape.dto.ChangePasswordRequest;
import com.petscape.dto.UpdateProfileRequest;
import com.petscape.dto.UserResponse;
import com.petscape.entity.User;
import com.petscape.service.IUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Settings")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final IUserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current user's profile")
    public ResponseEntity<UserResponse> getProfile(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(userService.getProfile(currentUser));
    }

    @PutMapping("/me/profile")
    @Operation(summary = "Update profile info")
    public ResponseEntity<UserResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(userService.updateProfile(request, currentUser));
    }

    @PutMapping("/me/password")
    @Operation(summary = "Change password")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal User currentUser) {
        userService.changePassword(request, currentUser);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @DeleteMapping("/me")
    @Operation(summary = "Delete account permanently")
    public ResponseEntity<Map<String, String>> deleteAccount(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User currentUser) {
        userService.deleteAccount(currentUser, body.get("password"));
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }
}
