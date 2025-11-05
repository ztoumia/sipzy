package com.sipzy.admin.mapper;

import com.sipzy.admin.domain.Activity;
import com.sipzy.admin.dto.response.ActivityResponse;
import com.sipzy.coffee.mapper.CoffeeMapper;
import com.sipzy.user.mapper.UserMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * MapStruct mapper for Activity entity
 */
@Mapper(componentModel = "spring", uses = {UserMapper.class, CoffeeMapper.class})
public interface ActivityMapper {

    @Mapping(target = "type", expression = "java(activity.getType().name())")
    @Mapping(target = "timestamp", source = "createdAt")
    @Mapping(target = "user", source = "user")
    @Mapping(target = "coffee", source = "coffee")
    ActivityResponse toActivityResponse(Activity activity);
}
