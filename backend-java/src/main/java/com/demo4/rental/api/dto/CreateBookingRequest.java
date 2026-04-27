package com.demo4.rental.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CreateBookingRequest(
    @NotBlank String equipmentId,
    @NotBlank String customer,
    String phone,
    @NotBlank String startDate,
    @NotBlank String endDate,
    @NotNull @DecimalMin("0.0") BigDecimal total,
    @NotBlank String customerType,
    @NotBlank String bookingType,
    @NotBlank String duration,
    String notes
) {
}
