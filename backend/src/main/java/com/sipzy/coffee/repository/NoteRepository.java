package com.sipzy.coffee.repository;

import com.sipzy.coffee.domain.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Note Repository
 */
@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    List<Note> findByIdIn(List<Long> ids);
}
