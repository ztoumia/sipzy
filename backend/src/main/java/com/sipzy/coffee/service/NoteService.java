package com.sipzy.coffee.service;

import com.sipzy.coffee.domain.Note;
import com.sipzy.coffee.dto.response.NoteByCategoryResponse;
import com.sipzy.coffee.dto.response.NoteResponse;
import com.sipzy.coffee.mapper.NoteMapper;
import com.sipzy.coffee.repository.NoteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for Note business logic
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoteService {

    private final NoteRepository noteRepository;
    private final NoteMapper noteMapper;

    /**
     * Get all notes
     */
    public List<NoteResponse> getAllNotes() {
        log.info("Getting all notes");
        return noteRepository.findAll()
                .stream()
                .map(noteMapper::toNoteResponse)
                .toList();
    }

    /**
     * Get notes grouped by category
     */
    public List<NoteByCategoryResponse> getNotesByCategory() {
        log.info("Getting notes grouped by category");

        List<Note> allNotes = noteRepository.findAll();

        // Group notes by category
        Map<String, List<NoteResponse>> notesByCategory = allNotes.stream()
                .collect(Collectors.groupingBy(
                        note -> note.getCategory() != null ? note.getCategory() : "Uncategorized",
                        Collectors.mapping(noteMapper::toNoteResponse, Collectors.toList())
                ));

        // Convert to list of NoteByCategoryResponse
        return notesByCategory.entrySet().stream()
                .map(entry -> new NoteByCategoryResponse(entry.getKey(), entry.getValue()))
                .sorted((a, b) -> a.category().compareToIgnoreCase(b.category()))
                .toList();
    }
}
