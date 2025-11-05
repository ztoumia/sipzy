package com.sipzy.coffee.mapper;

import com.sipzy.coffee.domain.Note;
import com.sipzy.coffee.dto.response.NoteResponse;
import org.mapstruct.Mapper;

/**
 * MapStruct mapper for Note entity
 */
@Mapper(componentModel = "spring")
public interface NoteMapper {

    NoteResponse toNoteResponse(Note note);
}
