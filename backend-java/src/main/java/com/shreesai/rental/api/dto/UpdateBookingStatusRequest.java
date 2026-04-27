package com.shreesai.rental.api.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateBookingStatusRequest(@NotBlank String status) {
}
