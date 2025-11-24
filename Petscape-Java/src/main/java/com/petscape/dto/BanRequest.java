package com.petscape.dto;

import com.petscape.entity.User.BanReason;
import jakarta.validation.constraints.NotNull;

public record BanRequest(
        @NotNull(message = "Ban reason is required") BanReason reason,
        String comment,
        Integer durationDays // null = permanent ban
) {
}
