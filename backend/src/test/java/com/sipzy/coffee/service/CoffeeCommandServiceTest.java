package com.sipzy.coffee.service;

import com.sipzy.coffee.domain.Coffee;
import com.sipzy.coffee.domain.Note;
import com.sipzy.coffee.domain.Roaster;
import com.sipzy.coffee.dto.request.CreateCoffeeRequest;
import com.sipzy.coffee.dto.response.CoffeeResponse;
import com.sipzy.coffee.mapper.CoffeeMapper;
import com.sipzy.coffee.repository.CoffeeRepository;
import com.sipzy.coffee.repository.NoteRepository;
import com.sipzy.coffee.repository.RoasterRepository;
import com.sipzy.common.exception.ForbiddenException;
import com.sipzy.common.exception.ResourceNotFoundException;
import com.sipzy.user.domain.User;
import com.sipzy.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CoffeeCommandService Unit Tests")
class CoffeeCommandServiceTest {

    @Mock
    private CoffeeRepository coffeeRepository;

    @Mock
    private RoasterRepository roasterRepository;

    @Mock
    private NoteRepository noteRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CoffeeMapper coffeeMapper;

    @InjectMocks
    private CoffeeCommandService coffeeCommandService;

    private CreateCoffeeRequest createRequest;
    private User testUser;
    private User adminUser;
    private Roaster testRoaster;
    private List<Note> testNotes;
    private Coffee testCoffee;
    private CoffeeResponse coffeeResponse;

    @BeforeEach
    void setUp() {
        createRequest = new CreateCoffeeRequest();
        createRequest.setName("Ethiopian Yirgacheffe");
        createRequest.setRoasterId(1L);
        createRequest.setOrigin("Ethiopia");
        createRequest.setProcess("Washed");
        createRequest.setVariety("Heirloom");
        createRequest.setAltitudeMin(1800);
        createRequest.setHarvestYear(2024);
        createRequest.setDescription("Floral and citrus notes");
        createRequest.setNoteIds(Arrays.asList(1L, 2L));

        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .role(User.UserRole.USER)
                .build();

        adminUser = User.builder()
                .id(2L)
                .username("admin")
                .email("admin@example.com")
                .role(User.UserRole.ADMIN)
                .build();

        testRoaster = Roaster.builder()
                .id(1L)
                .name("Test Roaster")
                .location("Ethiopia")
                .build();

        Note note1 = Note.builder().id(1L).name("Floral").build();
        Note note2 = Note.builder().id(2L).name("Citrus").build();
        testNotes = Arrays.asList(note1, note2);

        testCoffee = Coffee.builder()
                .id(1L)
                .name("Ethiopian Yirgacheffe")
                .roaster(testRoaster)
                .origin("Ethiopia")
                .submittedBy(testUser)
                .status(Coffee.CoffeeStatus.PENDING)
                .notes(testNotes)
                .build();

        coffeeResponse = new CoffeeResponse(
                1L, "Ethiopian Yirgacheffe", 1L, null, "Ethiopia",
                "Washed", "Heirloom", 1800, 2000, 2024,
                null, "Floral and citrus notes", null,
                null, 0, "PENDING", 1L, null, null, null,
                null, null, null, null
        );
    }

    @Test
    @DisplayName("Should create coffee successfully")
    void createCoffee_Success() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(roasterRepository.findById(1L)).thenReturn(Optional.of(testRoaster));
        when(noteRepository.findByIdIn(anyList())).thenReturn(testNotes);
        when(coffeeRepository.save(any(Coffee.class))).thenReturn(testCoffee);
        when(coffeeMapper.toCoffeeResponse(any(Coffee.class))).thenReturn(coffeeResponse);

        // When
        CoffeeResponse response = coffeeCommandService.createCoffee(createRequest, 1L);

        // Then
        assertNotNull(response);
        assertEquals("Ethiopian Yirgacheffe", response.name());
        assertEquals("PENDING", response.status());

        verify(userRepository).findById(1L);
        verify(roasterRepository).findById(1L);
        verify(noteRepository).findByIdIn(Arrays.asList(1L, 2L));
        verify(coffeeRepository).save(any(Coffee.class));
        verify(coffeeMapper).toCoffeeResponse(any(Coffee.class));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when user not found")
    void createCoffee_UserNotFound_ThrowsException() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class,
                () -> coffeeCommandService.createCoffee(createRequest, 1L));

        verify(userRepository).findById(1L);
        verify(roasterRepository, never()).findById(anyLong());
        verify(coffeeRepository, never()).save(any(Coffee.class));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when roaster not found")
    void createCoffee_RoasterNotFound_ThrowsException() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(roasterRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> coffeeCommandService.createCoffee(createRequest, 1L)
        );

        assertTrue(exception.getMessage().contains("Roaster not found"));
        verify(userRepository).findById(1L);
        verify(roasterRepository).findById(1L);
        verify(coffeeRepository, never()).save(any(Coffee.class));
    }

    @Test
    @DisplayName("Should approve coffee successfully by admin")
    void approveCoffee_Success() {
        // Given
        when(coffeeRepository.findById(1L)).thenReturn(Optional.of(testCoffee));
        when(userRepository.findById(2L)).thenReturn(Optional.of(adminUser));
        when(coffeeRepository.save(any(Coffee.class))).thenReturn(testCoffee);
        when(coffeeMapper.toCoffeeResponse(any(Coffee.class))).thenReturn(coffeeResponse);

        // When
        CoffeeResponse response = coffeeCommandService.approveCoffee(1L, 2L);

        // Then
        assertNotNull(response);
        verify(coffeeRepository).findById(1L);
        verify(userRepository).findById(2L);
        verify(coffeeRepository).save(any(Coffee.class));
    }

    @Test
    @DisplayName("Should throw ForbiddenException when non-admin tries to approve")
    void approveCoffee_NonAdmin_ThrowsForbiddenException() {
        // Given
        when(coffeeRepository.findById(1L)).thenReturn(Optional.of(testCoffee));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // When & Then
        ForbiddenException exception = assertThrows(
                ForbiddenException.class,
                () -> coffeeCommandService.approveCoffee(1L, 1L)
        );

        assertEquals("Only admins can moderate coffees", exception.getMessage());
        verify(coffeeRepository).findById(1L);
        verify(userRepository).findById(1L);
        verify(coffeeRepository, never()).save(any(Coffee.class));
    }

    @Test
    @DisplayName("Should reject coffee successfully by admin")
    void rejectCoffee_Success() {
        // Given
        String reason = "Incomplete information";
        when(coffeeRepository.findById(1L)).thenReturn(Optional.of(testCoffee));
        when(userRepository.findById(2L)).thenReturn(Optional.of(adminUser));
        when(coffeeRepository.save(any(Coffee.class))).thenReturn(testCoffee);
        when(coffeeMapper.toCoffeeResponse(any(Coffee.class))).thenReturn(coffeeResponse);

        // When
        CoffeeResponse response = coffeeCommandService.rejectCoffee(1L, 2L, reason);

        // Then
        assertNotNull(response);
        verify(coffeeRepository).findById(1L);
        verify(userRepository).findById(2L);
        verify(coffeeRepository).save(any(Coffee.class));
    }

    @Test
    @DisplayName("Should delete coffee successfully by admin")
    void deleteCoffee_Success() {
        // Given
        when(coffeeRepository.findById(1L)).thenReturn(Optional.of(testCoffee));
        when(userRepository.findById(2L)).thenReturn(Optional.of(adminUser));

        // When
        coffeeCommandService.deleteCoffee(1L, 2L);

        // Then
        verify(coffeeRepository).findById(1L);
        verify(userRepository).findById(2L);
        verify(coffeeRepository).delete(testCoffee);
    }

    @Test
    @DisplayName("Should throw ForbiddenException when non-admin tries to delete")
    void deleteCoffee_NonAdmin_ThrowsForbiddenException() {
        // Given
        when(coffeeRepository.findById(1L)).thenReturn(Optional.of(testCoffee));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // When & Then
        ForbiddenException exception = assertThrows(
                ForbiddenException.class,
                () -> coffeeCommandService.deleteCoffee(1L, 1L)
        );

        assertEquals("Only admins can delete coffees", exception.getMessage());
        verify(coffeeRepository).findById(1L);
        verify(userRepository).findById(1L);
        verify(coffeeRepository, never()).delete(any(Coffee.class));
    }
}
