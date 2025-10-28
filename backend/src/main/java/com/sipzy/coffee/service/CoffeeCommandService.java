package com.sipzy.coffee.service;

import com.sipzy.coffee.domain.Coffee;
import com.sipzy.coffee.domain.Note;
import com.sipzy.coffee.domain.Roaster;
import com.sipzy.coffee.dto.request.CreateCoffeeRequest;
import com.sipzy.coffee.dto.response.CoffeeResponse;
import com.sipzy.coffee.mapper.CoffeeMapper;
import com.sipzy.coffee.repository.CoffeeRepository;
import com.sipzy.coffee.repository.NoteRepository;
import com.sipzy.coffee.repository.RoasterRepository;
import com.sipzy.common.exception.ForbiddenException;
import com.sipzy.common.exception.ResourceNotFoundException;
import com.sipzy.upload.service.UploadService;
import com.sipzy.user.domain.User;
import com.sipzy.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Coffee Command Service (CQRS Write Side)
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CoffeeCommandService {

    private final CoffeeRepository coffeeRepository;
    private final RoasterRepository roasterRepository;
    private final NoteRepository noteRepository;
    private final UserRepository userRepository;
    private final CoffeeMapper coffeeMapper;
    private final UploadService uploadService;

    @CacheEvict(value = {"popularCoffees", "recentCoffees"}, allEntries = true)
    public CoffeeResponse createCoffee(CreateCoffeeRequest request, Long userId) {
        log.info("Creating coffee: {} by user: {}", request.getName(), userId);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Roaster roaster = roasterRepository.findById(request.getRoasterId())
            .orElseThrow(() -> new ResourceNotFoundException("Roaster not found with id: " + request.getRoasterId()));

        List<Note> notes = noteRepository.findByIdIn(request.getNoteIds());
        if (notes.size() != request.getNoteIds().size()) {
            throw new ResourceNotFoundException("One or more note IDs are invalid");
        }

        Coffee coffee = Coffee.builder()
            .name(request.getName())
            .roaster(roaster)
            .origin(request.getOrigin())
            .process(request.getProcess())
            .variety(request.getVariety())
            .altitudeMin(request.getAltitudeMin())
            .altitudeMax(request.getAltitudeMax())
            .harvestYear(request.getHarvestYear())
            .priceRange(request.getPriceRange())
            .description(request.getDescription())
            .imageUrl(request.getImageUrl())
            .status(Coffee.CoffeeStatus.PENDING)
            .submittedBy(user)
            .notes(notes)
            .build();

        coffee = coffeeRepository.save(coffee);
        log.info("Coffee created with id: {} and status: {}", coffee.getId(), coffee.getStatus());

        return coffeeMapper.toCoffeeResponse(coffee);
    }

    @CacheEvict(value = {"coffees", "popularCoffees", "recentCoffees"}, allEntries = true)
    public CoffeeResponse updateCoffee(Long coffeeId, CreateCoffeeRequest request, Long userId) {
        log.info("Updating coffee: {} by user: {}", coffeeId, userId);

        Coffee coffee = coffeeRepository.findById(coffeeId)
            .orElseThrow(() -> new ResourceNotFoundException("Coffee not found with id: " + coffeeId));

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!coffee.canBeEditedBy(user)) {
            throw new ForbiddenException("You don't have permission to edit this coffee");
        }

        Roaster roaster = roasterRepository.findById(request.getRoasterId())
            .orElseThrow(() -> new ResourceNotFoundException("Roaster not found with id: " + request.getRoasterId()));

        List<Note> notes = noteRepository.findByIdIn(request.getNoteIds());
        if (notes.size() != request.getNoteIds().size()) {
            throw new ResourceNotFoundException("One or more note IDs are invalid");
        }

        coffee.setName(request.getName());
        coffee.setRoaster(roaster);
        coffee.setOrigin(request.getOrigin());
        coffee.setProcess(request.getProcess());
        coffee.setVariety(request.getVariety());
        coffee.setAltitudeMin(request.getAltitudeMin());
        coffee.setAltitudeMax(request.getAltitudeMax());
        coffee.setHarvestYear(request.getHarvestYear());
        coffee.setPriceRange(request.getPriceRange());
        coffee.setDescription(request.getDescription());

        // Delete old image if being replaced
        if (request.getImageUrl() != null) {
            String oldImageUrl = coffee.getImageUrl();
            if (oldImageUrl != null && !oldImageUrl.equals(request.getImageUrl())) {
                uploadService.deleteImage(oldImageUrl);
            }
            coffee.setImageUrl(request.getImageUrl());
        }

        coffee.setNotes(notes);

        coffee = coffeeRepository.save(coffee);
        log.info("Coffee updated: {}", coffee.getId());

        return coffeeMapper.toCoffeeResponse(coffee);
    }

    @CacheEvict(value = {"coffees", "popularCoffees", "recentCoffees"}, allEntries = true)
    public void deleteCoffee(Long coffeeId, Long userId) {
        log.info("Deleting coffee: {} by user: {}", coffeeId, userId);

        Coffee coffee = coffeeRepository.findById(coffeeId)
            .orElseThrow(() -> new ResourceNotFoundException("Coffee not found with id: " + coffeeId));

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.isAdmin()) {
            throw new ForbiddenException("Only admins can delete coffees");
        }

        // Delete image from Cloudinary before deleting coffee
        if (coffee.getImageUrl() != null) {
            uploadService.deleteImage(coffee.getImageUrl());
        }

        coffeeRepository.delete(coffee);
        log.info("Coffee deleted: {}", coffeeId);
    }

    @CacheEvict(value = {"coffees", "popularCoffees", "recentCoffees"}, allEntries = true)
    public CoffeeResponse approveCoffee(Long coffeeId, Long moderatorId) {
        log.info("Approving coffee: {} by moderator: {}", coffeeId, moderatorId);

        Coffee coffee = coffeeRepository.findById(coffeeId)
            .orElseThrow(() -> new ResourceNotFoundException("Coffee not found with id: " + coffeeId));

        User moderator = userRepository.findById(moderatorId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!moderator.isAdmin()) {
            throw new ForbiddenException("Only admins can moderate coffees");
        }

        coffee.approve(moderator);
        coffee = coffeeRepository.save(coffee);
        log.info("Coffee approved: {}", coffeeId);

        return coffeeMapper.toCoffeeResponse(coffee);
    }

    @CacheEvict(value = {"coffees", "popularCoffees", "recentCoffees"}, allEntries = true)
    public CoffeeResponse rejectCoffee(Long coffeeId, Long moderatorId, String reason) {
        log.info("Rejecting coffee: {} by moderator: {}", coffeeId, moderatorId);

        Coffee coffee = coffeeRepository.findById(coffeeId)
            .orElseThrow(() -> new ResourceNotFoundException("Coffee not found with id: " + coffeeId));

        User moderator = userRepository.findById(moderatorId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!moderator.isAdmin()) {
            throw new ForbiddenException("Only admins can moderate coffees");
        }

        coffee.reject(moderator, reason);
        coffee = coffeeRepository.save(coffee);
        log.info("Coffee rejected: {}", coffeeId);

        return coffeeMapper.toCoffeeResponse(coffee);
    }
}
