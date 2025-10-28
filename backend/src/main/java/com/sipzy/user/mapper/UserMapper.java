package com.sipzy.user.mapper;

import com.sipzy.user.domain.User;
import com.sipzy.user.dto.response.UserResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * MapStruct mapper for User entity
 */
@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "role", expression = "java(user.getRole().name())")
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "emailVerified", source = "isVerified")
    UserResponse toUserResponse(User user);
}
