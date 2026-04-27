package com.shreesai.rental.service;

import com.shreesai.rental.api.dto.BookingResponse;
import com.shreesai.rental.api.dto.CreateBookingRequest;
import com.shreesai.rental.api.dto.EquipmentResponse;
import com.shreesai.rental.api.dto.StatsResponse;
import com.shreesai.rental.domain.BookingStatus;
import com.shreesai.rental.domain.BookingType;
import com.shreesai.rental.domain.CustomerType;
import com.shreesai.rental.entity.Booking;
import com.shreesai.rental.entity.Equipment;
import com.shreesai.rental.repository.BookingRepository;
import com.shreesai.rental.repository.EquipmentRepository;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;
import java.util.EnumSet;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RentalService {
  private static final EnumSet<BookingStatus> RESERVED_STATUSES = EnumSet.of(BookingStatus.CONFIRMED);
  private static final EnumSet<BookingStatus> REVENUE_STATUSES = EnumSet.of(
      BookingStatus.CONFIRMED,
      BookingStatus.COMPLETED
  );

  private final EquipmentRepository equipmentRepository;
  private final BookingRepository bookingRepository;

  public RentalService(EquipmentRepository equipmentRepository, BookingRepository bookingRepository) {
    this.equipmentRepository = equipmentRepository;
    this.bookingRepository = bookingRepository;
  }

  @Transactional(readOnly = true)
  public List<EquipmentResponse> getEquipment() {
    return equipmentRepository.findAll().stream()
        .map(this::syncAvailability)
        .map(EquipmentResponse::fromEntity)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<BookingResponse> getBookings() {
    return bookingRepository.findAllByOrderByCreatedAtDesc().stream()
        .map(BookingResponse::fromEntity)
        .toList();
  }

  @Transactional(readOnly = true)
  public StatsResponse getStats() {
    List<Equipment> equipment = equipmentRepository.findAll().stream()
        .map(this::syncAvailability)
        .toList();
    List<Booking> bookings = bookingRepository.findAll();

    long reservedUnits = equipment.stream()
        .mapToLong(item -> reservedCount(item.getId()))
        .sum();
    long totalMachines = equipment.stream()
        .mapToLong(Equipment::getStock)
        .sum();
    long activeBookings = bookings.stream()
        .filter(booking -> RESERVED_STATUSES.contains(booking.getStatus()))
        .count();
    BigDecimal totalRevenue = bookings.stream()
        .filter(booking -> REVENUE_STATUSES.contains(booking.getStatus()))
        .map(Booking::getTotal)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    long utilization = totalMachines > 0
        ? BigDecimal.valueOf(reservedUnits)
            .multiply(BigDecimal.valueOf(100))
            .divide(BigDecimal.valueOf(totalMachines), 0, RoundingMode.HALF_UP)
            .longValue()
        : 0L;

    return new StatsResponse(totalRevenue, activeBookings, utilization);
  }

  @Transactional
  public BookingResponse createBooking(CreateBookingRequest request) {
    Equipment equipment = equipmentRepository.findById(request.equipmentId())
        .orElseThrow(() -> new EntityNotFoundException("Equipment not found"));

    Booking booking = new Booking();
    booking.setId(generateBookingId());
    booking.setEquipment(equipment);
    booking.setCustomer(request.customer().trim());
    booking.setPhone(request.phone() == null ? null : request.phone().trim());
    booking.setEquipmentName(equipment.getName());
    booking.setLocation(equipment.getLocation());
    booking.setStartDate(parseDate(request.startDate()));
    booking.setEndDate(parseDate(request.endDate()));
    booking.setTotal(request.total());
    booking.setCustomerType(CustomerType.valueOf(request.customerType().trim().toUpperCase()));
    booking.setBookingType(BookingType.valueOf(request.bookingType().trim().toUpperCase()));
    booking.setDuration(request.duration().trim());
    booking.setCreatedAt(OffsetDateTime.now(ZoneOffset.UTC));
    booking.setStatus(BookingStatus.PENDING);
    booking.setNotes(request.notes() == null ? null : request.notes().trim());

    return BookingResponse.fromEntity(bookingRepository.save(booking));
  }

  @Transactional
  public BookingResponse updateBookingStatus(String id, String statusValue) {
    Booking booking = bookingRepository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("Booking not found"));

    booking.setStatus(BookingStatus.valueOf(statusValue.trim().toUpperCase()));
    return BookingResponse.fromEntity(bookingRepository.save(booking));
  }

  private Equipment syncAvailability(Equipment equipment) {
    long reservedUnits = reservedCount(equipment.getId());
    equipment.setAvailability(equipment.getStock() - reservedUnits > 0);
    return equipment;
  }

  private long reservedCount(String equipmentId) {
    return bookingRepository.countByEquipment_IdAndStatusIn(equipmentId, RESERVED_STATUSES);
  }

  private OffsetDateTime parseDate(String rawValue) {
    try {
      return OffsetDateTime.parse(rawValue);
    } catch (DateTimeParseException ignored) {
      return LocalDate.parse(rawValue).atStartOfDay().atOffset(ZoneOffset.UTC);
    }
  }

  private String generateBookingId() {
    return "BK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
  }
}
