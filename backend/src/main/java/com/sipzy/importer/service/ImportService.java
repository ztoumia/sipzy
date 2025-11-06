package com.sipzy.importer.service;

import com.sipzy.coffee.domain.Coffee;
import com.sipzy.coffee.domain.Note;
import com.sipzy.coffee.domain.Roaster;
import com.sipzy.coffee.repository.CoffeeRepository;
import com.sipzy.coffee.repository.NoteRepository;
import com.sipzy.coffee.repository.RoasterRepository;
import com.sipzy.common.exception.BadRequestException;
import com.sipzy.common.exception.ResourceNotFoundException;
import com.sipzy.importer.dto.request.BatchImportRequest;
import com.sipzy.importer.dto.request.ImportCoffeeRequest;
import com.sipzy.importer.dto.request.ImportRoasterRequest;
import com.sipzy.importer.dto.response.ImportResponse;
import com.sipzy.importer.dto.response.ImportResult;
import com.sipzy.user.domain.User;
import com.sipzy.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service for importing roasters and coffees from external data sources.
 * Supports both creation and update operations with image handling.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ImportService {

    private final RoasterRepository roasterRepository;
    private final CoffeeRepository coffeeRepository;
    private final NoteRepository noteRepository;
    private final UserRepository userRepository;
    private final ImageDownloadService imageDownloadService;

    /**
     * Import a single roaster.
     *
     * @param request The roaster import request
     * @return The import result
     */
    @Transactional
    public ImportResult importRoaster(ImportRoasterRequest request) {
        try {
            log.info("Importing roaster: {}", request.getName());

            // Validation
            if (request.getName() == null || request.getName().isBlank()) {
                return ImportResult.error(
                        ImportResult.EntityType.ROASTER,
                        request.getName(),
                        "Roaster name is required"
                );
            }

            // Check if update or create
            if (request.getId() != null) {
                return updateRoaster(request);
            } else {
                return createRoaster(request);
            }

        } catch (Exception e) {
            log.error("Error importing roaster: {}", request.getName(), e);
            return ImportResult.error(
                    ImportResult.EntityType.ROASTER,
                    request.getName(),
                    "Import failed: " + e.getMessage()
            );
        }
    }

    /**
     * Create a new roaster.
     */
    private ImportResult createRoaster(ImportRoasterRequest request) {
        // Check for duplicates by name
        Optional<Roaster> existing = roasterRepository.findByName(request.getName());
        if (existing.isPresent()) {
            log.info("Roaster already exists with name: {}, skipping", request.getName());
            return ImportResult.success(
                    ImportResult.EntityType.ROASTER,
                    ImportResult.Operation.SKIP,
                    existing.get().getId(),
                    request.getName()
            );
        }

        // Download and upload logo if provided
        String logoUrl = null;
        String warning = null;
        if (request.getLogoUrl() != null && !request.getLogoUrl().isBlank()) {
            logoUrl = imageDownloadService.downloadAndUploadImage(request.getLogoUrl(), "roasters");
            if (logoUrl == null) {
                warning = "Failed to download logo image from URL: " + request.getLogoUrl();
                log.warn(warning);
            }
        }

        // Create roaster
        Roaster roaster = new Roaster();
        roaster.setName(request.getName());
        roaster.setDescription(request.getDescription());
        roaster.setLocation(request.getLocation());
        roaster.setWebsite(request.getWebsite());
        roaster.setLogoUrl(logoUrl);
        roaster.setIsVerified(request.getIsVerified() != null ? request.getIsVerified() : true);

        roaster = roasterRepository.save(roaster);
        log.info("Created roaster: {} with ID: {}", roaster.getName(), roaster.getId());

        if (warning != null) {
            return ImportResult.successWithWarning(
                    ImportResult.EntityType.ROASTER,
                    ImportResult.Operation.CREATE,
                    roaster.getId(),
                    roaster.getName(),
                    warning
            );
        }

        return ImportResult.success(
                ImportResult.EntityType.ROASTER,
                ImportResult.Operation.CREATE,
                roaster.getId(),
                roaster.getName()
        );
    }

    /**
     * Update an existing roaster.
     */
    private ImportResult updateRoaster(ImportRoasterRequest request) {
        Optional<Roaster> roasterOpt = roasterRepository.findById(request.getId());
        if (roasterOpt.isEmpty()) {
            return ImportResult.error(
                    ImportResult.EntityType.ROASTER,
                    request.getName(),
                    "Roaster not found with ID: " + request.getId()
            );
        }

        Roaster roaster = roasterOpt.get();
        String warning = null;

        // Update fields if provided
        if (request.getName() != null && !request.getName().isBlank()) {
            // Check for name conflict with other roasters
            Optional<Roaster> existing = roasterRepository.findByName(request.getName());
            if (existing.isPresent() && !existing.get().getId().equals(roaster.getId())) {
                return ImportResult.error(
                        ImportResult.EntityType.ROASTER,
                        request.getName(),
                        "Another roaster already exists with name: " + request.getName()
                );
            }
            roaster.setName(request.getName());
        }

        if (request.getDescription() != null) {
            roaster.setDescription(request.getDescription());
        }

        if (request.getLocation() != null) {
            roaster.setLocation(request.getLocation());
        }

        if (request.getWebsite() != null) {
            roaster.setWebsite(request.getWebsite());
        }

        if (request.getIsVerified() != null) {
            roaster.setIsVerified(request.getIsVerified());
        }

        // Handle logo update
        if (request.getLogoUrl() != null && !request.getLogoUrl().isBlank()) {
            String newLogoUrl = imageDownloadService.downloadAndUploadImage(request.getLogoUrl(), "roasters");
            if (newLogoUrl != null) {
                roaster.setLogoUrl(newLogoUrl);
            } else {
                warning = "Failed to download logo image from URL: " + request.getLogoUrl();
                log.warn(warning);
            }
        }

        roaster = roasterRepository.save(roaster);
        log.info("Updated roaster: {} with ID: {}", roaster.getName(), roaster.getId());

        if (warning != null) {
            return ImportResult.successWithWarning(
                    ImportResult.EntityType.ROASTER,
                    ImportResult.Operation.UPDATE,
                    roaster.getId(),
                    roaster.getName(),
                    warning
            );
        }

        return ImportResult.success(
                ImportResult.EntityType.ROASTER,
                ImportResult.Operation.UPDATE,
                roaster.getId(),
                roaster.getName()
        );
    }

    /**
     * Import a single coffee.
     *
     * @param request The coffee import request
     * @return The import result
     */
    @Transactional
    @CacheEvict(value = {"coffees", "popularCoffees", "recentCoffees"}, allEntries = true)
    public ImportResult importCoffee(ImportCoffeeRequest request) {
        try {
            log.info("Importing coffee: {}", request.getName());

            // Validation
            if (request.getName() == null || request.getName().isBlank()) {
                return ImportResult.error(
                        ImportResult.EntityType.COFFEE,
                        request.getName(),
                        "Coffee name is required"
                );
            }

            // Check if update or create
            if (request.getId() != null) {
                return updateCoffee(request);
            } else {
                return createCoffee(request);
            }

        } catch (Exception e) {
            log.error("Error importing coffee: {}", request.getName(), e);
            return ImportResult.error(
                    ImportResult.EntityType.COFFEE,
                    request.getName(),
                    "Import failed: " + e.getMessage()
            );
        }
    }

    /**
     * Create a new coffee.
     */
    private ImportResult createCoffee(ImportCoffeeRequest request) {
        // Resolve roaster
        Roaster roaster = resolveRoaster(request);
        if (roaster == null) {
            return ImportResult.error(
                    ImportResult.EntityType.COFFEE,
                    request.getName(),
                    "Roaster not found or could not be created"
            );
        }

        // Resolve notes
        List<Note> notes = resolveNotes(request);
        if (notes.isEmpty()) {
            return ImportResult.error(
                    ImportResult.EntityType.COFFEE,
                    request.getName(),
                    "At least one valid note is required"
            );
        }

        // Resolve submitter
        User submitter = resolveSubmitter(request);
        if (submitter == null) {
            return ImportResult.error(
                    ImportResult.EntityType.COFFEE,
                    request.getName(),
                    "Submitter user not found"
            );
        }

        // Download and upload image if provided
        String imageUrl = null;
        String warning = null;
        if (request.getImageUrl() != null && !request.getImageUrl().isBlank()) {
            imageUrl = imageDownloadService.downloadAndUploadImage(request.getImageUrl(), "coffees");
            if (imageUrl == null) {
                warning = "Failed to download image from URL: " + request.getImageUrl();
                log.warn(warning);
            }
        }

        // Create coffee
        Coffee coffee = new Coffee();
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
        coffee.setImageUrl(imageUrl);
        coffee.setSubmittedBy(submitter);
        coffee.setNotes(notes);

        // Set status based on autoApprove flag
        boolean autoApprove = request.getAutoApprove() != null && request.getAutoApprove();
        if (autoApprove) {
            coffee.setStatus(Coffee.CoffeeStatus.APPROVED);
        } else {
            coffee.setStatus(Coffee.CoffeeStatus.PENDING);
        }

        coffee = coffeeRepository.save(coffee);
        log.info("Created coffee: {} with ID: {}, status: {}", coffee.getName(), coffee.getId(), coffee.getStatus());

        if (warning != null) {
            return ImportResult.successWithWarning(
                    ImportResult.EntityType.COFFEE,
                    ImportResult.Operation.CREATE,
                    coffee.getId(),
                    coffee.getName(),
                    warning
            );
        }

        return ImportResult.success(
                ImportResult.EntityType.COFFEE,
                ImportResult.Operation.CREATE,
                coffee.getId(),
                coffee.getName()
        );
    }

    /**
     * Update an existing coffee.
     */
    private ImportResult updateCoffee(ImportCoffeeRequest request) {
        Optional<Coffee> coffeeOpt = coffeeRepository.findById(request.getId());
        if (coffeeOpt.isEmpty()) {
            return ImportResult.error(
                    ImportResult.EntityType.COFFEE,
                    request.getName(),
                    "Coffee not found with ID: " + request.getId()
            );
        }

        Coffee coffee = coffeeOpt.get();
        String warning = null;

        // Update fields if provided
        if (request.getName() != null && !request.getName().isBlank()) {
            coffee.setName(request.getName());
        }

        if (request.getRoasterId() != null || request.getRoasterName() != null) {
            Roaster roaster = resolveRoaster(request);
            if (roaster != null) {
                coffee.setRoaster(roaster);
            } else {
                warning = "Roaster not found, keeping existing roaster";
                log.warn(warning);
            }
        }

        if (request.getOrigin() != null) {
            coffee.setOrigin(request.getOrigin());
        }

        if (request.getProcess() != null) {
            coffee.setProcess(request.getProcess());
        }

        if (request.getVariety() != null) {
            coffee.setVariety(request.getVariety());
        }

        if (request.getAltitudeMin() != null) {
            coffee.setAltitudeMin(request.getAltitudeMin());
        }

        if (request.getAltitudeMax() != null) {
            coffee.setAltitudeMax(request.getAltitudeMax());
        }

        if (request.getHarvestYear() != null) {
            coffee.setHarvestYear(request.getHarvestYear());
        }

        if (request.getPriceRange() != null) {
            coffee.setPriceRange(request.getPriceRange());
        }

        if (request.getDescription() != null) {
            coffee.setDescription(request.getDescription());
        }

        // Handle notes update
        if ((request.getNoteIds() != null && !request.getNoteIds().isEmpty()) ||
                (request.getNoteNames() != null && !request.getNoteNames().isEmpty())) {
            List<Note> notes = resolveNotes(request);
            if (!notes.isEmpty()) {
                coffee.setNotes(notes);
            }
        }

        // Handle image update
        if (request.getImageUrl() != null && !request.getImageUrl().isBlank()) {
            String newImageUrl = imageDownloadService.downloadAndUploadImage(request.getImageUrl(), "coffees");
            if (newImageUrl != null) {
                coffee.setImageUrl(newImageUrl);
            } else {
                String imageWarning = "Failed to download image from URL: " + request.getImageUrl();
                warning = warning == null ? imageWarning : warning + "; " + imageWarning;
                log.warn(imageWarning);
            }
        }

        // Handle auto-approve
        if (request.getAutoApprove() != null && request.getAutoApprove() && coffee.isPending()) {
            coffee.setStatus(Coffee.CoffeeStatus.APPROVED);
        }

        coffee = coffeeRepository.save(coffee);
        log.info("Updated coffee: {} with ID: {}", coffee.getName(), coffee.getId());

        if (warning != null) {
            return ImportResult.successWithWarning(
                    ImportResult.EntityType.COFFEE,
                    ImportResult.Operation.UPDATE,
                    coffee.getId(),
                    coffee.getName(),
                    warning
            );
        }

        return ImportResult.success(
                ImportResult.EntityType.COFFEE,
                ImportResult.Operation.UPDATE,
                coffee.getId(),
                coffee.getName()
        );
    }

    /**
     * Batch import roasters and coffees.
     *
     * @param request The batch import request
     * @return The import response with all results
     */
    @Transactional
    public ImportResponse batchImport(BatchImportRequest request) {
        log.info("Starting batch import: {} roasters, {} coffees",
                request.getRoasters() != null ? request.getRoasters().size() : 0,
                request.getCoffees() != null ? request.getCoffees().size() : 0);

        ImportResponse response = ImportResponse.builder()
                .results(new ArrayList<>())
                .build();

        boolean continueOnError = request.getContinueOnError() != null && request.getContinueOnError();

        // Import roasters first
        if (request.getRoasters() != null) {
            for (ImportRoasterRequest roasterRequest : request.getRoasters()) {
                ImportResult result = importRoaster(roasterRequest);
                response.addResult(result);

                if (!continueOnError && !result.getSuccess()) {
                    log.warn("Stopping batch import due to error in roaster: {}", roasterRequest.getName());
                    response.generateMessage();
                    return response;
                }
            }
        }

        // Import coffees
        if (request.getCoffees() != null) {
            for (ImportCoffeeRequest coffeeRequest : request.getCoffees()) {
                // Apply global autoApprove setting if not specified in individual request
                if (coffeeRequest.getAutoApprove() == null && request.getAutoApprove() != null) {
                    coffeeRequest.setAutoApprove(request.getAutoApprove());
                }

                ImportResult result = importCoffee(coffeeRequest);
                response.addResult(result);

                if (!continueOnError && !result.getSuccess()) {
                    log.warn("Stopping batch import due to error in coffee: {}", coffeeRequest.getName());
                    response.generateMessage();
                    return response;
                }
            }
        }

        response.generateMessage();
        log.info("Batch import completed: {}", response.getMessage());
        return response;
    }

    /**
     * Resolve roaster from request (by ID or name).
     */
    private Roaster resolveRoaster(ImportCoffeeRequest request) {
        // Try by ID first
        if (request.getRoasterId() != null) {
            return roasterRepository.findById(request.getRoasterId()).orElse(null);
        }

        // Try by name
        if (request.getRoasterName() != null && !request.getRoasterName().isBlank()) {
            return roasterRepository.findByName(request.getRoasterName()).orElse(null);
        }

        return null;
    }

    /**
     * Resolve notes from request (by IDs or names).
     */
    private List<Note> resolveNotes(ImportCoffeeRequest request) {
        List<Note> notes = new ArrayList<>();

        // Try by IDs first
        if (request.getNoteIds() != null && !request.getNoteIds().isEmpty()) {
            notes = noteRepository.findByIdIn(request.getNoteIds());
        }

        // Try by names if no notes found
        if (notes.isEmpty() && request.getNoteNames() != null && !request.getNoteNames().isEmpty()) {
            List<Note> allNotes = noteRepository.findAll();
            notes = allNotes.stream()
                    .filter(note -> request.getNoteNames().contains(note.getName()))
                    .collect(Collectors.toList());
        }

        return notes;
    }

    /**
     * Resolve submitter user from request or return admin user.
     */
    private User resolveSubmitter(ImportCoffeeRequest request) {
        // Try by provided user ID
        if (request.getSubmittedById() != null) {
            Optional<User> user = userRepository.findById(request.getSubmittedById());
            if (user.isPresent()) {
                return user.get();
            }
        }

        // Fallback to first admin user
        List<User> users = userRepository.findAll();
        return users.stream()
                .filter(User::isAdmin)
                .findFirst()
                .orElseGet(() -> users.isEmpty() ? null : users.get(0));
    }
}
