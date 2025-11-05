package com.sipzy.coffee.controller;

import com.sipzy.coffee.domain.Note;
import com.sipzy.coffee.repository.NoteRepository;
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
 * Integration Tests for NoteController
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@DisplayName("NoteController Integration Tests")
class NoteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private NoteRepository noteRepository;

    private Note citrusNote;
    private Note berryNote;
    private Note jasmineNote;
    private Note chocolateNote;

    @BeforeEach
    void setUp() {
        noteRepository.deleteAll();

        // Use unique names with timestamp to avoid constraint violations
        String uniqueSuffix = String.valueOf(System.currentTimeMillis());

        citrusNote = new Note();
        citrusNote.setName("Citrus_" + uniqueSuffix);
        citrusNote.setCategory("Fruity");
        citrusNote = noteRepository.save(citrusNote);

        berryNote = new Note();
        berryNote.setName("Berry_" + uniqueSuffix);
        berryNote.setCategory("Fruity");
        berryNote = noteRepository.save(berryNote);

        jasmineNote = new Note();
        jasmineNote.setName("Jasmine_" + uniqueSuffix);
        jasmineNote.setCategory("Floral");
        jasmineNote = noteRepository.save(jasmineNote);

        chocolateNote = new Note();
        chocolateNote.setName("Chocolate_" + uniqueSuffix);
        chocolateNote.setCategory("Sweet");
        chocolateNote = noteRepository.save(chocolateNote);
    }

    @Test
    @DisplayName("GET /api/notes - Should return all notes")
    void getAllNotes_Success() throws Exception {
        mockMvc.perform(get("/api/notes")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data", hasSize(4)))
                .andExpect(jsonPath("$.data[0].id").exists())
                .andExpect(jsonPath("$.data[0].name").exists())
                .andExpect(jsonPath("$.data[0].category").exists())
                .andExpect(jsonPath("$.data[0].createdAt").exists())
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @DisplayName("GET /api/notes - Should return empty list when no notes")
    void getAllNotes_EmptyList() throws Exception {
        noteRepository.deleteAll();

        mockMvc.perform(get("/api/notes")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    @Test
    @DisplayName("GET /api/notes/categories - Should return notes grouped by category")
    void getNotesByCategory_Success() throws Exception {
        mockMvc.perform(get("/api/notes/categories")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data", hasSize(3))) // 3 categories: Floral, Fruity, Sweet
                .andExpect(jsonPath("$.data[*].category", containsInAnyOrder("Floral", "Fruity", "Sweet")))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @DisplayName("GET /api/notes/categories - Should have correct notes in each category")
    void getNotesByCategory_CorrectGrouping() throws Exception {
        mockMvc.perform(get("/api/notes/categories")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                // Check that categories are sorted alphabetically
                .andExpect(jsonPath("$.data[0].category").value("Floral"))
                .andExpect(jsonPath("$.data[0].notes", hasSize(1)))
                .andExpect(jsonPath("$.data[1].category").value("Fruity"))
                .andExpect(jsonPath("$.data[1].notes", hasSize(2)))
                .andExpect(jsonPath("$.data[2].category").value("Sweet"))
                .andExpect(jsonPath("$.data[2].notes", hasSize(1)));
    }

    @Test
    @DisplayName("GET /api/notes/categories - Should handle notes without category")
    void getNotesByCategory_WithUncategorized() throws Exception {
        // Add a note without category
        Note uncategorizedNote = new Note();
        uncategorizedNote.setName("Complex");
        uncategorizedNote.setCategory(null);
        noteRepository.save(uncategorizedNote);

        mockMvc.perform(get("/api/notes/categories")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data", hasSize(4))) // 3 categories + Uncategorized
                .andExpect(jsonPath("$.data[*].category", hasItem("Uncategorized")));
    }

    @Test
    @DisplayName("GET /api/notes/categories - Should return empty list when no notes")
    void getNotesByCategory_EmptyList() throws Exception {
        noteRepository.deleteAll();

        mockMvc.perform(get("/api/notes/categories")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    @Test
    @DisplayName("GET /api/notes/categories - Should sort categories alphabetically")
    void getNotesByCategory_AlphabeticalSort() throws Exception {
        mockMvc.perform(get("/api/notes/categories")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data", hasSize(3)))
                // Verify alphabetical order: Floral, Fruity, Sweet
                .andExpect(jsonPath("$.data[0].category").value("Floral"))
                .andExpect(jsonPath("$.data[1].category").value("Fruity"))
                .andExpect(jsonPath("$.data[2].category").value("Sweet"));
    }
}
