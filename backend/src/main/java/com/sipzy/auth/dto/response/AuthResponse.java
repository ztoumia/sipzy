package com.sipzy.auth.dto.response;

import com.sipzy.user.dto.response.UserResponse;

public record AuthResponse(
    UserResponse user,
    String token
) {}
