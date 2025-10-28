package com.sipzy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Point d'entrée principal de l'application Sipzy.coffee Backend
 *
 * Spring Boot 3.2 avec Java 17
 * Architecture: REST API avec PostgreSQL
 */
@SpringBootApplication
public class SipzyApplication {

    public static void main(String[] args) {
        SpringApplication.run(SipzyApplication.class, args);
    }
}
