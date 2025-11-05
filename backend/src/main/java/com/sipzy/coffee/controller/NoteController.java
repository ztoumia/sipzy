package com.sipzy.coffee.controller;

import com.sipzy.coffee.dto.response.NoteByCategoryResponse;
import com.sipzy.coffee.dto.response.NoteResponse;
import com.sipzy.coffee.service.NoteService;
import com.sipzy.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for Note endpoints
 */
@Slf4j
@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
@Tag(name = "Notes", description = "Endpoints pour gérer les notes aromatiques")
public class NoteController {

    private final NoteService noteService;

    @GetMapping
    @Operation(summary = "Liste des notes", description = "Récupérer toutes les notes aromatiques")
    public ResponseEntity<ApiResponse<List<NoteResponse>>> getAllNotes() {
        log.info("Get all notes");
        List<NoteResponse> response = noteService.getAllNotes();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/categories")
    @Operation(summary = "Notes par catégorie", description = "Récupérer les notes groupées par catégorie")
    public ResponseEntity<ApiResponse<List<NoteByCategoryResponse>>> getNotesByCategory() {
        log.info("Get notes by category");
        List<NoteByCategoryResponse> response = noteService.getNotesByCategory();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
