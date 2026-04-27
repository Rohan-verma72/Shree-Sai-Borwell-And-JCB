package com.demo4.rental.bootstrap;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.seed")
public record SeedDataProperties(boolean enabled) {
}
