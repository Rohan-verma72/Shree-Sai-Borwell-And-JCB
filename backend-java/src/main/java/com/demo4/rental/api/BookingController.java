package com.demo4.rental.api;

import com.demo4.rental.api.dto.BookingResponse;
import com.demo4.rental.api.dto.CreateBookingRequest;
import com.demo4.rental.api.dto.UpdateBookingStatusRequest;
import com.demo4.rental.service.RentalService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
  private final RentalService rentalService;

  public BookingController(RentalService rentalService) {
    this.rentalService = rentalService;
  }

  @GetMapping
  public List<BookingResponse> getBookings() {
    return rentalService.getBookings();
  }

  @PostMapping
  public Map<String, Object> createBooking(@Valid @RequestBody CreateBookingRequest request) {
    BookingResponse booking = rentalService.createBooking(request);
    return Map.of("success", true, "booking", booking);
  }

  @PatchMapping("/{id}")
  public Map<String, Object> updateBookingStatus(
      @PathVariable String id,
      @Valid @RequestBody UpdateBookingStatusRequest request
  ) {
    BookingResponse booking = rentalService.updateBookingStatus(id, request.status());
    return Map.of("success", true, "booking", booking);
  }
}
