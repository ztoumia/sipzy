package com.sipzy.admin.service;

import com.sipzy.admin.domain.Activity;
import com.sipzy.admin.domain.ActivityType;
import com.sipzy.admin.dto.response.ActivityResponse;
import com.sipzy.admin.repository.ActivityRepository;
import com.sipzy.coffee.domain.Coffee;
import com.sipzy.coffee.repository.CoffeeRepository;
import com.sipzy.user.domain.User;
import com.sipzy.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration Tests for AdminService - Activity Log functionality
 */
@SpringBootTest
@Transactional
@DisplayName("AdminService - Activity Log Integration Tests")
class AdminActivityServiceTest {

    @Autowired
    private AdminService adminService;

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CoffeeRepository coffeeRepository;

    private User testUser;
    private Coffee testCoffee;

    @BeforeEach
    void setUp() {
        activityRepository.deleteAll();
        coffeeRepository.deleteAll();
        userRepository.deleteAll();

        // Use unique identifiers to avoid constraint violations
        String uniqueSuffix = String.valueOf(System.currentTimeMillis());

        // Create test user
        testUser = User.builder()
                .username("testuser_" + uniqueSuffix)
                .email("test_" + uniqueSuffix + "@example.com")
                .passwordHash("$2a$10$dummyhashfortesting")
                .role(User.UserRole.USER)
                .build();
        testUser = userRepository.save(testUser);

        // Create test coffee
        testCoffee = Coffee.builder()
                .name("Test Coffee " + uniqueSuffix)
                .origin("Ethiopia")
                .build();
        testCoffee = coffeeRepository.save(testCoffee);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("getRecentActivity - Should return recent activities ordered by timestamp")
    void getRecentActivity_Success() {
        // Given - Create activities with different timestamps
        Instant now = Instant.now();

        Activity activity1 = Activity.builder()
                .type(ActivityType.COFFEE_SUBMITTED)
                .message("Coffee submitted")
                .user(testUser)
                .coffee(testCoffee)
                .createdAt(now.minusSeconds(3600))
                .build();

        Activity activity2 = Activity.builder()
                .type(ActivityType.COFFEE_APPROVED)
                .message("Coffee approved")
                .user(testUser)
                .coffee(testCoffee)
                .createdAt(now.minusSeconds(1800))
                .build();

        Activity activity3 = Activity.builder()
                .type(ActivityType.REPORT_CREATED)
                .message("Report created")
                .user(testUser)
                .coffee(null)
                .createdAt(now)
                .build();

        activityRepository.save(activity1);
        activityRepository.save(activity2);
        activityRepository.save(activity3);

        // When
        List<ActivityResponse> result = adminService.getRecentActivity(10);

        // Then
        assertNotNull(result);
        assertEquals(3, result.size());

        // Verify order (most recent first)
        assertEquals("REPORT_CREATED", result.get(0).type());
        assertEquals("COFFEE_APPROVED", result.get(1).type());
        assertEquals("COFFEE_SUBMITTED", result.get(2).type());

        // Verify timestamps are in descending order
        assertTrue(result.get(0).timestamp().isAfter(result.get(1).timestamp()));
        assertTrue(result.get(1).timestamp().isAfter(result.get(2).timestamp()));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("getRecentActivity - Should respect limit parameter")
    void getRecentActivity_WithLimit() {
        // Given - Create 5 activities
        for (int i = 0; i < 5; i++) {
            Activity activity = Activity.builder()
                    .type(ActivityType.COFFEE_SUBMITTED)
                    .message("Activity " + i)
                    .user(testUser)
                    .coffee(testCoffee)
                    .createdAt(Instant.now().minusSeconds(i * 100))
                    .build();
            activityRepository.save(activity);
        }

        // When - Request only 3
        List<ActivityResponse> result = adminService.getRecentActivity(3);

        // Then
        assertNotNull(result);
        assertEquals(3, result.size());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("getRecentActivity - Should return empty list when no activities")
    void getRecentActivity_EmptyList() {
        // When
        List<ActivityResponse> result = adminService.getRecentActivity(10);

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("getRecentActivity - Should handle activities without coffee")
    void getRecentActivity_WithoutCoffee() {
        // Given - Activity without coffee (report)
        Activity activity = Activity.builder()
                .type(ActivityType.REPORT_CREATED)
                .message("Report created")
                .user(testUser)
                .coffee(null)
                .createdAt(Instant.now())
                .build();
        activityRepository.save(activity);

        // When
        List<ActivityResponse> result = adminService.getRecentActivity(10);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("REPORT_CREATED", result.get(0).type());
        assertNull(result.get(0).coffee());
        assertNotNull(result.get(0).user());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("getRecentActivity - Should include user and coffee details")
    void getRecentActivity_WithDetails() {
        // Given
        Activity activity = Activity.builder()
                .type(ActivityType.COFFEE_SUBMITTED)
                .message("Test message")
                .user(testUser)
                .coffee(testCoffee)
                .createdAt(Instant.now())
                .build();
        activityRepository.save(activity);

        // When
        List<ActivityResponse> result = adminService.getRecentActivity(10);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());

        ActivityResponse response = result.get(0);
        assertNotNull(response.user());
        assertEquals(testUser.getUsername(), response.user().username());

        assertNotNull(response.coffee());
        assertEquals(testCoffee.getName(), response.coffee().name());

        assertEquals("Test message", response.message());
        assertNotNull(response.timestamp());
    }
}
