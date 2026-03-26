package com.petscape.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;


public record DonationRequest(
                @NotNull(message = "Amount is required") @DecimalMin(value = "1.00", message = "Minimum donation amount is $1.00") BigDecimal amount,
                String clientBaseUrl) {
}
