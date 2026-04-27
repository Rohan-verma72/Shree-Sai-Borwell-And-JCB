package com.demo4.rental.api.dto;

import com.demo4.rental.entity.Equipment;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record EquipmentResponse(
    String id,
    String name,
    String type,
    Integer stock,
    String image,
    List<String> images,
    Map<String, String> specifications,
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
  public static EquipmentResponse fromEntity(Equipment equipment) {
    return new EquipmentResponse(
        equipment.getId(),
        equipment.getName(),
        formatLabel(equipment.getType().name()),
        equipment.getStock(),
        equipment.getImage(),
        equipment.getImages(),
        equipment.getSpecifications(),
        equipment.getDailyRate(),
        equipment.getMonthlyRate(),
        equipment.getHourlyRate(),
        equipment.getFarmerDailyRate(),
        equipment.getFarmerHourlyRate(),
        equipment.getAvailability(),
        formatLabel(equipment.getCondition().name()),
        equipment.getLocation(),
        equipment.getDescription()
    );
  }

  private static String formatLabel(String rawValue) {
    if ("JCB".equals(rawValue)) {
      return rawValue;
    }

    String normalized = rawValue.toLowerCase().replace('_', ' ');
    String[] parts = normalized.split(" ");
    StringBuilder builder = new StringBuilder();

    for (int index = 0; index < parts.length; index++) {
      if (parts[index].isBlank()) {
        continue;
      }
      if (builder.length() > 0) {
        builder.append(' ');
      }
      builder.append(Character.toUpperCase(parts[index].charAt(0)));
      builder.append(parts[index].substring(1));
    }

    return builder.toString();
  }
}
