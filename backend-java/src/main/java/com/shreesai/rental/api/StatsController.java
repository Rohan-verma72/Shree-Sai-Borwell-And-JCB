package com.shreesai.rental.api;

import com.shreesai.rental.api.dto.StatsResponse;
import com.shreesai.rental.service.RentalService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
public class StatsController {
  private final RentalService rentalService;

  public StatsController(RentalService rentalService) {
    this.rentalService = rentalService;
  }

  @GetMapping
  public StatsResponse getStats() {
    return rentalService.getStats();
  }
}
