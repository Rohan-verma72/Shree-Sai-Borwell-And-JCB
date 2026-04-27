package com.shreesai.rental.entity;

import com.shreesai.rental.domain.EquipmentCondition;
import com.shreesai.rental.domain.EquipmentType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapKeyColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "equipment")
public class Equipment {
  @Id
  @Column(length = 50)
  private String id;

  @Column(nullable = false, length = 120)
  private String name;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30)
  private EquipmentType type;

  @Column(nullable = false)
  private Integer stock;

  @Column(nullable = false, length = 255)
  private String image;

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "equipment_images", joinColumns = @JoinColumn(name = "equipment_id"))
  @OrderColumn(name = "image_order")
  @Column(name = "image_url", nullable = false, length = 255)
  private List<String> images = new ArrayList<>();

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "equipment_specifications", joinColumns = @JoinColumn(name = "equipment_id"))
  @MapKeyColumn(name = "spec_key")
  @Column(name = "spec_value", nullable = false, length = 255)
  private Map<String, String> specifications = new HashMap<>();

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal dailyRate;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal monthlyRate;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal hourlyRate;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal farmerDailyRate;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal farmerHourlyRate;

  @Column(nullable = false)
  private Boolean availability;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 40)
  private EquipmentCondition condition;

  @Column(nullable = false, length = 120)
  private String location;

  @Column(nullable = false, length = 500)
  private String description;

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public EquipmentType getType() {
    return type;
  }

  public void setType(EquipmentType type) {
    this.type = type;
  }

  public Integer getStock() {
    return stock;
  }

  public void setStock(Integer stock) {
    this.stock = stock;
  }

  public String getImage() {
    return image;
  }

  public void setImage(String image) {
    this.image = image;
  }

  public List<String> getImages() {
    return images;
  }

  public void setImages(List<String> images) {
    this.images = images;
  }

  public Map<String, String> getSpecifications() {
    return specifications;
  }

  public void setSpecifications(Map<String, String> specifications) {
    this.specifications = specifications;
  }

  public BigDecimal getDailyRate() {
    return dailyRate;
  }

  public void setDailyRate(BigDecimal dailyRate) {
    this.dailyRate = dailyRate;
  }

  public BigDecimal getMonthlyRate() {
    return monthlyRate;
  }

  public void setMonthlyRate(BigDecimal monthlyRate) {
    this.monthlyRate = monthlyRate;
  }

  public BigDecimal getHourlyRate() {
    return hourlyRate;
  }

  public void setHourlyRate(BigDecimal hourlyRate) {
    this.hourlyRate = hourlyRate;
  }

  public BigDecimal getFarmerDailyRate() {
    return farmerDailyRate;
  }

  public void setFarmerDailyRate(BigDecimal farmerDailyRate) {
    this.farmerDailyRate = farmerDailyRate;
  }

  public BigDecimal getFarmerHourlyRate() {
    return farmerHourlyRate;
  }

  public void setFarmerHourlyRate(BigDecimal farmerHourlyRate) {
    this.farmerHourlyRate = farmerHourlyRate;
  }

  public Boolean getAvailability() {
    return availability;
  }

  public void setAvailability(Boolean availability) {
    this.availability = availability;
  }

  public EquipmentCondition getCondition() {
    return condition;
  }

  public void setCondition(EquipmentCondition condition) {
    this.condition = condition;
  }

  public String getLocation() {
    return location;
  }

  public void setLocation(String location) {
    this.location = location;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }
}
