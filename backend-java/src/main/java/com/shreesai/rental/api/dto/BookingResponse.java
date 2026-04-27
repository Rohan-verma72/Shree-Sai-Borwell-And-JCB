package com.shreesai.rental.api.dto;

import com.shreesai.rental.entity.Booking;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record BookingResponse(
    String id,
    String equipmentId,
    String customer,
    String phone,
    String equipment,
    String location,
    OffsetDateTime startDate,
    OffsetDateTime endDate,
    BigDecimal total,
    String customerType,
    String bookingType,
    String duration,
    OffsetDateTime createdAt,
    String status,
    String notes
) {
  public static BookingResponse fromEntity(Booking booking) {
    return new BookingResponse(
        booking.getId(),
        booking.getEquipment() != null ? booking.getEquipment().getId() : null,
        booking.getCustomer(),
        booking.getPhone(),
        booking.getEquipmentName(),
        booking.getLocation(),
        booking.getStartDate(),
        booking.getEndDate(),
        booking.getTotal(),
        formatLabel(booking.getCustomerType().name()),
        formatLabel(booking.getBookingType().name()),
        booking.getDuration(),
        booking.getCreatedAt(),
        formatLabel(booking.getStatus().name()),
        booking.getNotes()
    );
  }

  private static String formatLabel(String rawValue) {
    String normalized = rawValue.toLowerCase().replace('_', ' ');
    return Character.toUpperCase(normalized.charAt(0)) + normalized.substring(1);
  }
}
