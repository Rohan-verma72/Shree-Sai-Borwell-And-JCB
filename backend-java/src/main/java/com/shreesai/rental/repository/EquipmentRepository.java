package com.shreesai.rental.repository;

import com.shreesai.rental.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EquipmentRepository extends JpaRepository<Equipment, String> {
}
