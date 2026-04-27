package com.shreesai.rental.repository;

import com.shreesai.rental.domain.BookingStatus;
import com.shreesai.rental.entity.Booking;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, String> {
  long countByEquipment_IdAndStatusIn(String equipmentId, Collection<BookingStatus> statuses);

  List<Booking> findAllByOrderByCreatedAtDesc();
}
