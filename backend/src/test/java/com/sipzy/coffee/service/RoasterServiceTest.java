package com.sipzy.coffee.service;

import com.sipzy.coffee.domain.Roaster;
import com.sipzy.coffee.dto.response.RoasterResponse;
import com.sipzy.coffee.mapper.RoasterMapper;
import com.sipzy.coffee.repository.RoasterRepository;
import com.sipzy.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("RoasterService Unit Tests")
class RoasterServiceTest {

    @Mock
    private RoasterRepository roasterRepository;

    @Mock
    private RoasterMapper roasterMapper;

    @InjectMocks
    private RoasterService roasterService;

    private Roaster testRoaster1;
    private Roaster testRoaster2;
    private RoasterResponse roasterResponse1;
    private RoasterResponse roasterResponse2;

    @BeforeEach
    void setUp() {
        testRoaster1 = new Roaster();
        testRoaster1.setId(1L);
        testRoaster1.setName("Blue Bottle Coffee");
        testRoaster1.setDescription("Specialty coffee roaster from California");
        testRoaster1.setLocation("Oakland, CA");
        testRoaster1.setWebsite("https://bluebottlecoffee.com");
        testRoaster1.setLogoUrl("https://example.com/logo1.png");
        testRoaster1.setCreatedAt(Instant.now());
        testRoaster1.setUpdatedAt(Instant.now());

        testRoaster2 = new Roaster();
        testRoaster2.setId(2L);
        testRoaster2.setName("Stumptown Coffee");
        testRoaster2.setDescription("Portland's finest coffee roaster");
        testRoaster2.setLocation("Portland, OR");
        testRoaster2.setWebsite("https://stumptowncoffee.com");
        testRoaster2.setLogoUrl("https://example.com/logo2.png");
        testRoaster2.setCreatedAt(Instant.now());
        testRoaster2.setUpdatedAt(Instant.now());

        roasterResponse1 = new RoasterResponse(
                1L,
                "Blue Bottle Coffee",
                "Specialty coffee roaster from California",
                "Oakland, CA",
                "https://bluebottlecoffee.com",
                "https://example.com/logo1.png",
                true,
                testRoaster1.getCreatedAt(),
                testRoaster1.getUpdatedAt()
        );

        roasterResponse2 = new RoasterResponse(
                2L,
                "Stumptown Coffee",
                "Portland's finest coffee roaster",
                "Portland, OR",
                "https://stumptowncoffee.com",
                "https://example.com/logo2.png",
                true,
                testRoaster2.getCreatedAt(),
                testRoaster2.getUpdatedAt()
        );
    }

    @Test
    @DisplayName("getAllRoasters - Should return all roasters")
    void getAllRoasters_Success() {
        // Given
        List<Roaster> roasters = Arrays.asList(testRoaster1, testRoaster2);
        when(roasterRepository.findAll()).thenReturn(roasters);
        when(roasterMapper.toRoasterResponse(testRoaster1)).thenReturn(roasterResponse1);
        when(roasterMapper.toRoasterResponse(testRoaster2)).thenReturn(roasterResponse2);

        // When
        List<RoasterResponse> result = roasterService.getAllRoasters();

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Blue Bottle Coffee", result.get(0).name());
        assertEquals("Stumptown Coffee", result.get(1).name());
        verify(roasterRepository, times(1)).findAll();
        verify(roasterMapper, times(2)).toRoasterResponse(any(Roaster.class));
    }

    @Test
    @DisplayName("getAllRoasters - Should return empty list when no roasters")
    void getAllRoasters_EmptyList() {
        // Given
        when(roasterRepository.findAll()).thenReturn(List.of());

        // When
        List<RoasterResponse> result = roasterService.getAllRoasters();

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(roasterRepository, times(1)).findAll();
        verify(roasterMapper, never()).toRoasterResponse(any());
    }

    @Test
    @DisplayName("getRoasterById - Should return roaster when found")
    void getRoasterById_Success() {
        // Given
        Long roasterId = 1L;
        when(roasterRepository.findById(roasterId)).thenReturn(Optional.of(testRoaster1));
        when(roasterMapper.toRoasterResponse(testRoaster1)).thenReturn(roasterResponse1);

        // When
        RoasterResponse result = roasterService.getRoasterById(roasterId);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.id());
        assertEquals("Blue Bottle Coffee", result.name());
        assertEquals("Oakland, CA", result.location());
        verify(roasterRepository, times(1)).findById(roasterId);
        verify(roasterMapper, times(1)).toRoasterResponse(testRoaster1);
    }

    @Test
    @DisplayName("getRoasterById - Should throw ResourceNotFoundException when not found")
    void getRoasterById_NotFound() {
        // Given
        Long roasterId = 999L;
        when(roasterRepository.findById(roasterId)).thenReturn(Optional.empty());

        // When & Then
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> roasterService.getRoasterById(roasterId)
        );

        assertTrue(exception.getMessage().contains("Roaster"));
        assertTrue(exception.getMessage().contains("999"));
        verify(roasterRepository, times(1)).findById(roasterId);
        verify(roasterMapper, never()).toRoasterResponse(any());
    }
}
