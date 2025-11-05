package com.sipzy.coffee.mapper;

import com.sipzy.coffee.domain.Roaster;
import com.sipzy.coffee.dto.response.RoasterResponse;
import com.sipzy.coffee.dto.response.RoasterSummary;
import org.mapstruct.Mapper;

/**
 * MapStruct mapper for Roaster entity
 */
@Mapper(componentModel = "spring")
public interface RoasterMapper {

    RoasterResponse toRoasterResponse(Roaster roaster);

    RoasterSummary toRoasterSummary(Roaster roaster);
}
