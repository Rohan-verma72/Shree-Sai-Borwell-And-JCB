package com.shreesai.rental.api.dto;

import java.math.BigDecimal;

public record StatsResponse(
    BigDecimal totalRevenue,
    long activeBookings,
    long utilization
) {
}
