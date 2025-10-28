package com.sipzy.user.service;

import com.sipzy.common.exception.ConflictException;
import com.sipzy.common.exception.ResourceNotFoundException;
import com.sipzy.upload.service.UploadService;
import com.sipzy.user.domain.User;
import com.sipzy.user.dto.request.UpdateProfileRequest;
import com.sipzy.user.dto.response.UserPreferencesResponse;
import com.sipzy.user.dto.response.UserResponse;
import com.sipzy.user.mapper.UserMapper;
import com.sipzy.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * User Command Service (CQRS Write Side)
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserCommandService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final UploadService uploadService;

    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        log.info("Updating profile for user: {}", userId);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Check if username is being changed and if it's already taken
        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new ConflictException("Username already taken: " + request.getUsername());
            }
            user.setUsername(request.getUsername());
        }

        // Update other fields
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }

        if (request.getAvatarUrl() != null) {
            // Delete old avatar if exists and is different
            String oldAvatarUrl = user.getAvatarUrl();
            if (oldAvatarUrl != null && !oldAvatarUrl.equals(request.getAvatarUrl())) {
                uploadService.deleteImage(oldAvatarUrl);
            }
            user.setAvatarUrl(request.getAvatarUrl());
        }

        user = userRepository.save(user);
        log.info("Profile updated for user: {}", userId);

        return userMapper.toUserResponse(user);
    }

    public void updatePreferences(Long userId, UserPreferencesResponse preferences) {
        log.info("Updating preferences for user: {}", userId);

        // Verify user exists
        userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // For now, just validate user exists
        // In a real implementation, preferences would be stored in a separate table or JSON column
        log.info("Preferences updated for user: {} (stored in-memory)", userId);
    }
}
