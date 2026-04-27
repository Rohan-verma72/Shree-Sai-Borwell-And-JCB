package com.shreesai.rental;

import com.shreesai.rental.bootstrap.SeedDataProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(SeedDataProperties.class)
public class RentalApplication {
  public static void main(String[] args) {
    SpringApplication.run(RentalApplication.class, args);
  }
}
