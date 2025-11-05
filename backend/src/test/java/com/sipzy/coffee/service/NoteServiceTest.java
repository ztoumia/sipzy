package com.sipzy.coffee.service;

import com.sipzy.coffee.domain.Note;
import com.sipzy.coffee.dto.response.NoteByCategoryResponse;
import com.sipzy.coffee.dto.response.NoteResponse;
import com.sipzy.coffee.mapper.NoteMapper;
import com.sipzy.coffee.repository.NoteRepository;
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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("NoteService Unit Tests")
class NoteServiceTest {

    @Mock
    private NoteRepository noteRepository;

    @Mock
    private NoteMapper noteMapper;

    @InjectMocks
    private NoteService noteService;

    private Note fruitNote1;
    private Note fruitNote2;
    private Note floralNote;
    private Note noteWithoutCategory;
    private NoteResponse fruitResponse1;
    private NoteResponse fruitResponse2;
    private NoteResponse floralResponse;
    private NoteResponse uncategorizedResponse;

    @BeforeEach
    void setUp() {
        Instant now = Instant.now();

        fruitNote1 = new Note();
        fruitNote1.setId(1L);
        fruitNote1.setName("Citrus");
        fruitNote1.setCategory("Fruity");
        fruitNote1.setCreatedAt(now);

        fruitNote2 = new Note();
        fruitNote2.setId(2L);
        fruitNote2.setName("Berry");
        fruitNote2.setCategory("Fruity");
        fruitNote2.setCreatedAt(now);

        floralNote = new Note();
        floralNote.setId(3L);
        floralNote.setName("Jasmine");
        floralNote.setCategory("Floral");
        floralNote.setCreatedAt(now);

        noteWithoutCategory = new Note();
        noteWithoutCategory.setId(4L);
        noteWithoutCategory.setName("Complex");
        noteWithoutCategory.setCategory(null);
        noteWithoutCategory.setCreatedAt(now);

        fruitResponse1 = new NoteResponse(1L, "Citrus", "Fruity", now);
        fruitResponse2 = new NoteResponse(2L, "Berry", "Fruity", now);
        floralResponse = new NoteResponse(3L, "Jasmine", "Floral", now);
        uncategorizedResponse = new NoteResponse(4L, "Complex", null, now);
    }

    @Test
    @DisplayName("getAllNotes - Should return all notes")
    void getAllNotes_Success() {
        // Given
        List<Note> notes = Arrays.asList(fruitNote1, fruitNote2, floralNote);
        when(noteRepository.findAll()).thenReturn(notes);
        when(noteMapper.toNoteResponse(fruitNote1)).thenReturn(fruitResponse1);
        when(noteMapper.toNoteResponse(fruitNote2)).thenReturn(fruitResponse2);
        when(noteMapper.toNoteResponse(floralNote)).thenReturn(floralResponse);

        // When
        List<NoteResponse> result = noteService.getAllNotes();

        // Then
        assertNotNull(result);
        assertEquals(3, result.size());
        assertEquals("Citrus", result.get(0).name());
        assertEquals("Berry", result.get(1).name());
        assertEquals("Jasmine", result.get(2).name());
        verify(noteRepository, times(1)).findAll();
        verify(noteMapper, times(3)).toNoteResponse(any(Note.class));
    }

    @Test
    @DisplayName("getAllNotes - Should return empty list when no notes")
    void getAllNotes_EmptyList() {
        // Given
        when(noteRepository.findAll()).thenReturn(List.of());

        // When
        List<NoteResponse> result = noteService.getAllNotes();

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(noteRepository, times(1)).findAll();
        verify(noteMapper, never()).toNoteResponse(any());
    }

    @Test
    @DisplayName("getNotesByCategory - Should group notes by category")
    void getNotesByCategory_Success() {
        // Given
        List<Note> notes = Arrays.asList(fruitNote1, fruitNote2, floralNote);
        when(noteRepository.findAll()).thenReturn(notes);
        when(noteMapper.toNoteResponse(fruitNote1)).thenReturn(fruitResponse1);
        when(noteMapper.toNoteResponse(fruitNote2)).thenReturn(fruitResponse2);
        when(noteMapper.toNoteResponse(floralNote)).thenReturn(floralResponse);

        // When
        List<NoteByCategoryResponse> result = noteService.getNotesByCategory();

        // Then
        assertNotNull(result);
        assertEquals(2, result.size()); // 2 categories: Floral and Fruity (sorted alphabetically)

        // Check Floral category (alphabetically first)
        NoteByCategoryResponse floralCategory = result.get(0);
        assertEquals("Floral", floralCategory.category());
        assertEquals(1, floralCategory.notes().size());
        assertEquals("Jasmine", floralCategory.notes().get(0).name());

        // Check Fruity category
        NoteByCategoryResponse fruityCategory = result.get(1);
        assertEquals("Fruity", fruityCategory.category());
        assertEquals(2, fruityCategory.notes().size());
        assertTrue(fruityCategory.notes().stream().anyMatch(n -> n.name().equals("Citrus")));
        assertTrue(fruityCategory.notes().stream().anyMatch(n -> n.name().equals("Berry")));

        verify(noteRepository, times(1)).findAll();
        verify(noteMapper, times(3)).toNoteResponse(any(Note.class));
    }

    @Test
    @DisplayName("getNotesByCategory - Should handle notes without category")
    void getNotesByCategory_WithUncategorized() {
        // Given
        List<Note> notes = Arrays.asList(fruitNote1, noteWithoutCategory);
        when(noteRepository.findAll()).thenReturn(notes);
        when(noteMapper.toNoteResponse(fruitNote1)).thenReturn(fruitResponse1);
        when(noteMapper.toNoteResponse(noteWithoutCategory)).thenReturn(uncategorizedResponse);

        // When
        List<NoteByCategoryResponse> result = noteService.getNotesByCategory();

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());

        // Find Uncategorized category
        NoteByCategoryResponse uncategorized = result.stream()
                .filter(c -> c.category().equals("Uncategorized"))
                .findFirst()
                .orElse(null);

        assertNotNull(uncategorized);
        assertEquals(1, uncategorized.notes().size());
        assertEquals("Complex", uncategorized.notes().get(0).name());

        verify(noteRepository, times(1)).findAll();
        verify(noteMapper, times(2)).toNoteResponse(any(Note.class));
    }

    @Test
    @DisplayName("getNotesByCategory - Should return empty list when no notes")
    void getNotesByCategory_EmptyList() {
        // Given
        when(noteRepository.findAll()).thenReturn(List.of());

        // When
        List<NoteByCategoryResponse> result = noteService.getNotesByCategory();

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(noteRepository, times(1)).findAll();
        verify(noteMapper, never()).toNoteResponse(any());
    }

    @Test
    @DisplayName("getNotesByCategory - Should sort categories alphabetically")
    void getNotesByCategory_AlphabeticalSort() {
        // Given
        List<Note> notes = Arrays.asList(fruitNote1, floralNote, fruitNote2);
        when(noteRepository.findAll()).thenReturn(notes);
        when(noteMapper.toNoteResponse(fruitNote1)).thenReturn(fruitResponse1);
        when(noteMapper.toNoteResponse(fruitNote2)).thenReturn(fruitResponse2);
        when(noteMapper.toNoteResponse(floralNote)).thenReturn(floralResponse);

        // When
        List<NoteByCategoryResponse> result = noteService.getNotesByCategory();

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Floral", result.get(0).category()); // Alphabetically first
        assertEquals("Fruity", result.get(1).category()); // Alphabetically second

        verify(noteRepository, times(1)).findAll();
    }
}
