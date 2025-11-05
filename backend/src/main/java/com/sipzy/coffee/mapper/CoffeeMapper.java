package com.sipzy.coffee.mapper;

import com.sipzy.coffee.domain.Coffee;
import com.sipzy.coffee.domain.Note;
import com.sipzy.coffee.dto.response.CoffeeResponse;
import com.sipzy.coffee.dto.response.NoteSummary;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.stream.Collectors;

/**
 * MapStruct mapper for Coffee entity
 */
@Mapper(componentModel = "spring", uses = {RoasterMapper.class})
public interface CoffeeMapper {

    @Mapping(target = "roasterId", source = "roaster.id")
    @Mapping(target = "roaster", source = "roaster")
    @Mapping(target = "avgRating", source = "averageRating")
    @Mapping(target = "status", expression = "java(coffee.getStatus().name())")
    @Mapping(target = "submittedBy", source = "submittedBy.id")
    @Mapping(target = "submittedByUser", source = "submittedBy", ignore = true)
    @Mapping(target = "approvedBy", source = "moderatedBy.id")
    @Mapping(target = "approvedByUser", source = "moderatedBy", ignore = true)
    @Mapping(target = "approvedAt", source = "moderatedAt")
    @Mapping(target = "altitudeMin", source = "altitudeMin")
    @Mapping(target = "altitudeMax", source = "altitudeMax")
    @Mapping(target = "priceRange", source = "priceRange")
    @Mapping(target = "notes", expression = "java(toNoteSummaries(coffee.getNotes()))")
    CoffeeResponse toCoffeeResponse(Coffee coffee);

    default NoteSummary toNoteSummary(Note note) {
        if (note == null) {
            return null;
        }
        return new NoteSummary(
            note.getId(),
            note.getName(),
            note.getCategory()
        );
    }

    default List<NoteSummary> toNoteSummaries(List<Note> notes) {
        if (notes == null) {
            return null;
        }
        return notes.stream()
            .map(this::toNoteSummary)
            .collect(Collectors.toList());
    }
}
