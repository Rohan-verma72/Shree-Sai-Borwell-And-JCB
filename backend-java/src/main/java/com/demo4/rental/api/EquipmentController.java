package com.demo4.rental.api;

import com.demo4.rental.api.dto.EquipmentResponse;
import com.demo4.rental.service.RentalService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/equipment")
public class EquipmentController {
  private final RentalService rentalService;

  public EquipmentController(RentalService rentalService) {
    this.rentalService = rentalService;
  }

  @GetMapping
  public List<EquipmentResponse> getEquipment() {
    return rentalService.getEquipment();
  }
}
