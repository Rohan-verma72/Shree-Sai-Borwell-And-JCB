package com.shreesai.rental.bootstrap;

import com.shreesai.rental.domain.BookingStatus;
import com.shreesai.rental.domain.BookingType;
import com.shreesai.rental.domain.CustomerType;
import com.shreesai.rental.domain.EquipmentCondition;
import com.shreesai.rental.domain.EquipmentType;
import com.shreesai.rental.entity.Booking;
import com.shreesai.rental.entity.Equipment;
import com.shreesai.rental.repository.BookingRepository;
import com.shreesai.rental.repository.EquipmentRepository;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

@Component
public class SeedDataLoader implements CommandLineRunner {
  private final SeedDataProperties seedDataProperties;
  private final EquipmentRepository equipmentRepository;
  private final BookingRepository bookingRepository;
  private final ObjectMapper objectMapper;

  public SeedDataLoader(
      SeedDataProperties seedDataProperties,
      EquipmentRepository equipmentRepository,
      BookingRepository bookingRepository,
      ObjectMapper objectMapper
  ) {
    this.seedDataProperties = seedDataProperties;
    this.equipmentRepository = equipmentRepository;
    this.bookingRepository = bookingRepository;
    this.objectMapper = objectMapper;
  }

  @Override
  public void run(String... args) throws Exception {
    if (!seedDataProperties.enabled() || equipmentRepository.count() > 0 || bookingRepository.count() > 0) {
      return;
    }

    SeedPayload payload = readSeedPayload();
    List<Equipment> equipment = payload.equipment().stream()
        .map(this::toEquipmentEntity)
        .toList();

    equipmentRepository.saveAll(equipment);

    List<Booking> bookings = payload.bookings().stream()
        .map(item -> toBookingEntity(item, equipment))
        .toList();

    bookingRepository.saveAll(bookings);
  }

  private SeedPayload readSeedPayload() throws IOException {
    ClassPathResource resource = new ClassPathResource("seed-data.json");

    try (InputStream inputStream = resource.getInputStream()) {
      return objectMapper.readValue(inputStream, SeedPayload.class);
    }
  }

  private Equipment toEquipmentEntity(SeedEquipment source) {
    Equipment equipment = new Equipment();
    equipment.setId(source.id());
    equipment.setName(source.name());
    equipment.setType(EquipmentType.valueOf(source.type().toUpperCase()));
    equipment.setStock(source.stock());
    equipment.setImage(source.image());
    equipment.setImages(new ArrayList<>(source.images()));
    equipment.setSpecifications(new HashMap<>(source.specifications()));
    equipment.setDailyRate(source.dailyRate());
    equipment.setMonthlyRate(source.monthlyRate());
    equipment.setHourlyRate(source.hourlyRate());
    equipment.setFarmerDailyRate(source.farmerDailyRate());
    equipment.setFarmerHourlyRate(source.farmerHourlyRate());
    equipment.setAvailability(source.availability());
    equipment.setCondition(EquipmentCondition.valueOf(source.condition().toUpperCase().replace(' ', '_')));
    equipment.setLocation(source.location());
    equipment.setDescription(source.description());
    return equipment;
  }

  private Booking toBookingEntity(SeedBooking source, List<Equipment> equipmentList) {
    Booking booking = new Booking();
    Equipment equipment = equipmentList.stream()
        .filter(item -> item.getId().equals(source.equipmentId()) || item.getName().equals(source.equipment()))
        .findFirst()
        .orElse(null);

    booking.setId(source.id());
    booking.setEquipment(equipment);
    booking.setCustomer(source.customer());
    booking.setPhone(source.phone());
    booking.setEquipmentName(source.equipment());
    booking.setLocation(source.location());
    booking.setStartDate(parseDate(source.startDate()));
    booking.setEndDate(parseDate(source.endDate()));
    booking.setTotal(source.total());
    booking.setCustomerType(CustomerType.valueOf(source.customerType().toUpperCase()));
    booking.setBookingType(BookingType.valueOf(source.bookingType().toUpperCase()));
    booking.setDuration(source.duration());
    booking.setCreatedAt(parseDate(source.createdAt()));
    booking.setStatus(BookingStatus.valueOf(source.status().toUpperCase()));
    booking.setNotes(source.notes());
    return booking;
  }

  private OffsetDateTime parseDate(String rawValue) {
    try {
      return OffsetDateTime.parse(rawValue);
    } catch (DateTimeParseException ignored) {
      return LocalDate.parse(rawValue).atStartOfDay().atOffset(ZoneOffset.UTC);
    }
  }

  @JsonIgnoreProperties(ignoreUnknown = true)
  private record SeedPayload(
      List<SeedEquipment> equipment,
      List<SeedBooking> bookings
  ) {
  }

  @JsonIgnoreProperties(ignoreUnknown = true)
  private record SeedEquipment(
      String id,
      String name,
      String type,
      Integer stock,
      String image,
      List<String> images,
      java.util.Map<String, String> specifications,
      BigDecimal dailyRate,
      BigDecimal monthlyRate,
      BigDecimal hourlyRate,
      BigDecimal farmerDailyRate,
      BigDecimal farmerHourlyRate,
      Boolean availability,
      String condition,
      String location,
      String description
  ) {
  }

  @JsonIgnoreProperties(ignoreUnknown = true)
  private record SeedBooking(
      String id,
      String equipmentId,
      String customer,
      String phone,
      String equipment,
      String location,
      String startDate,
      String endDate,
      BigDecimal total,
      String customerType,
      String bookingType,
      String duration,
      String createdAt,
      String status,
      String notes
  ) {
  }
}
