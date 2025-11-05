package com.sipzy.coffee.controller;

import com.sipzy.coffee.domain.Roaster;
import com.sipzy.coffee.repository.RoasterRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration Tests for RoasterController
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@DisplayName("RoasterController Integration Tests")
class RoasterControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private RoasterRepository roasterRepository;

    private Roaster testRoaster1;
    private Roaster testRoaster2;

    @BeforeEach
    void setUp() {
        roasterRepository.deleteAll();

        // Use unique names with timestamp to avoid constraint violations
        String uniqueSuffix = String.valueOf(System.currentTimeMillis());

        testRoaster1 = new Roaster();
        testRoaster1.setName("Blue Bottle Coffee " + uniqueSuffix);
        testRoaster1.setDescription("Specialty coffee roaster from California");
        testRoaster1.setLocation("Oakland, CA");
        testRoaster1.setWebsite("https://bluebottlecoffee.com");
        testRoaster1.setLogoUrl("https://example.com/logo1.png");
        testRoaster1.setIsVerified(true);
        testRoaster1 = roasterRepository.save(testRoaster1);

        testRoaster2 = new Roaster();
        testRoaster2.setName("Stumptown Coffee " + uniqueSuffix);
        testRoaster2.setDescription("Portland's finest coffee roaster");
        testRoaster2.setLocation("Portland, OR");
        testRoaster2.setWebsite("https://stumptowncoffee.com");
        testRoaster2.setLogoUrl("https://example.com/logo2.png");
        testRoaster2.setIsVerified(true);
        testRoaster2 = roasterRepository.save(testRoaster2);
    }

    @Test
    @DisplayName("GET /api/roasters - Should return all roasters")
    void getAllRoasters_Success() throws Exception {
        mockMvc.perform(get("/api/roasters")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[0].location").value("Oakland, CA"))
                .andExpect(jsonPath("$.data[0].website").value("https://bluebottlecoffee.com"))
                .andExpect(jsonPath("$.data[1].location").value("Portland, OR"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @DisplayName("GET /api/roasters - Should return empty list when no roasters")
    void getAllRoasters_EmptyList() throws Exception {
        roasterRepository.deleteAll();

        mockMvc.perform(get("/api/roasters")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    @Test
    @DisplayName("GET /api/roasters/{id} - Should return roaster by ID")
    void getRoasterById_Success() throws Exception {
        mockMvc.perform(get("/api/roasters/{id}", testRoaster1.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(testRoaster1.getId()))
                .andExpect(jsonPath("$.data.description").value("Specialty coffee roaster from California"))
                .andExpect(jsonPath("$.data.location").value("Oakland, CA"))
                .andExpect(jsonPath("$.data.website").value("https://bluebottlecoffee.com"))
                .andExpect(jsonPath("$.data.logoUrl").value("https://example.com/logo1.png"))
                .andExpect(jsonPath("$.data.createdAt").exists())
                .andExpect(jsonPath("$.data.updatedAt").exists())
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @DisplayName("GET /api/roasters/{id} - Should return 404 when roaster not found")
    void getRoasterById_NotFound() throws Exception {
        Long nonExistentId = 999L;

        mockMvc.perform(get("/api/roasters/{id}", nonExistentId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").exists())
                .andExpect(jsonPath("$.message").value(containsString("Roaster")));
    }

    @Test
    @DisplayName("GET /api/roasters/{id} - Should return 400 for invalid ID format")
    void getRoasterById_InvalidId() throws Exception {
        mockMvc.perform(get("/api/roasters/{id}", "invalid")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }
}
