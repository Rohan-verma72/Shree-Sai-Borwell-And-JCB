package com.demo4.rental.repository;

import com.demo4.rental.domain.BookingStatus;
import com.demo4.rental.entity.Booking;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, String> {
  long countByEquipment_IdAndStatusIn(String equipmentId, Collection<BookingStatus> statuses);

  List<Booking> findAllByOrderByCreatedAtDesc();
}
