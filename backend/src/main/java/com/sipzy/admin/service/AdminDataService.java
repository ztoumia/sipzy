package com.sipzy.admin.service;

import com.sipzy.admin.domain.Activity;
import com.sipzy.admin.domain.ActivityType;
import com.sipzy.admin.domain.Report;
import com.sipzy.admin.dto.*;
import com.sipzy.admin.repository.ActivityRepository;
import com.sipzy.admin.repository.ReportRepository;
import com.sipzy.coffee.domain.Coffee;
import com.sipzy.coffee.domain.Note;
import com.sipzy.coffee.domain.Roaster;
import com.sipzy.coffee.repository.CoffeeRepository;
import com.sipzy.coffee.repository.NoteRepository;
import com.sipzy.coffee.repository.RoasterRepository;
import com.sipzy.review.domain.Review;
import com.sipzy.review.repository.ReviewRepository;
import com.sipzy.user.domain.User;
import com.sipzy.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for admin data management
 * Provides CRUD operations for all entities
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AdminDataService {

    private final UserRepository userRepository;
    private final CoffeeRepository coffeeRepository;
    private final RoasterRepository roasterRepository;
    private final NoteRepository noteRepository;
    private final ReviewRepository reviewRepository;
    private final ReportRepository reportRepository;
    private final ActivityRepository activityRepository;

    /**
     * Get metadata for all available entities
     */
    public List<EntityMetadata> getEntityMetadataList() {
        return Arrays.asList(
            getUserMetadata(),
            getCoffeeMetadata(),
            getRoasterMetadata(),
            getNoteMetadata(),
            getReviewMetadata(),
            getReportMetadata(),
            getActivityMetadata()
        );
    }

    /**
     * Get data for a specific entity type
     */
    public Map<String, Object> getEntityData(String entityType, int page, int size, String sortBy, String sortDirection) {
        Pageable pageable = PageRequest.of(page, size,
            Sort.Direction.fromString(sortDirection.toUpperCase()), sortBy);

        return switch (entityType.toLowerCase()) {
            case "users" -> getUserData(pageable);
            case "coffees" -> getCoffeeData(pageable);
            case "roasters" -> getRoasterData(pageable);
            case "notes" -> getNoteData(pageable);
            case "reviews" -> getReviewData(pageable);
            case "reports" -> getReportData(pageable);
            case "activities" -> getActivityData(pageable);
            default -> throw new IllegalArgumentException("Unknown entity type: " + entityType);
        };
    }

    /**
     * Get single entity by ID
     */
    public Object getEntityById(String entityType, Long id) {
        return switch (entityType.toLowerCase()) {
            case "users" -> getUserById(id);
            case "coffees" -> getCoffeeById(id);
            case "roasters" -> getRoasterById(id);
            case "notes" -> getNoteById(id);
            case "reviews" -> getReviewById(id);
            case "reports" -> getReportById(id);
            case "activities" -> getActivityById(id);
            default -> throw new IllegalArgumentException("Unknown entity type: " + entityType);
        };
    }

    /**
     * Update entity
     */
    @Transactional
    public Object updateEntity(String entityType, Long id, Map<String, Object> updates) {
        return switch (entityType.toLowerCase()) {
            case "users" -> updateUser(id, updates);
            case "coffees" -> updateCoffee(id, updates);
            case "roasters" -> updateRoaster(id, updates);
            case "notes" -> updateNote(id, updates);
            case "reviews" -> updateReview(id, updates);
            case "reports" -> updateReport(id, updates);
            default -> throw new IllegalArgumentException("Cannot update entity type: " + entityType);
        };
    }

    /**
     * Delete entity
     */
    @Transactional
    public void deleteEntity(String entityType, Long id) {
        switch (entityType.toLowerCase()) {
            case "users" -> userRepository.deleteById(id);
            case "coffees" -> coffeeRepository.deleteById(id);
            case "roasters" -> roasterRepository.deleteById(id);
            case "notes" -> noteRepository.deleteById(id);
            case "reviews" -> reviewRepository.deleteById(id);
            case "reports" -> reportRepository.deleteById(id);
            case "activities" -> activityRepository.deleteById(id);
            default -> throw new IllegalArgumentException("Unknown entity type: " + entityType);
        }
    }

    // ==================== USER METHODS ====================

    private EntityMetadata getUserMetadata() {
        return EntityMetadata.builder()
            .name("users")
            .displayName("Utilisateurs")
            .tableName("users")
            .fields(Arrays.asList(
                EntityMetadata.FieldMetadata.builder().name("id").displayName("ID").type("number").primaryKey(true).editable(false).build(),
                EntityMetadata.FieldMetadata.builder().name("username").displayName("Nom d'utilisateur").type("string").nullable(false).editable(true).build(),
                EntityMetadata.FieldMetadata.builder().name("email").displayName("Email").type("string").nullable(false).editable(true).build(),
                EntityMetadata.FieldMetadata.builder().name("role").displayName("Rôle").type("enum").nullable(false).editable(true)
                    .enumValues(Arrays.asList("USER", "ADMIN")).build(),
                EntityMetadata.FieldMetadata.builder().name("avatarUrl").displayName("Avatar").type("string").nullable(true).editable(true).build(),
                EntityMetadata.FieldMetadata.builder().name("bio").displayName("Biographie").type("string").nullable(true).editable(true).build(),
                EntityMetadata.FieldMetadata.builder().name("location").displayName("Localisation").type("string").nullable(true).editable(true).build(),
                EntityMetadata.FieldMetadata.builder().name("isVerified").displayName("Vérifié").type("boolean").nullable(false).editable(true).build(),
                EntityMetadata.FieldMetadata.builder().name("isActive").displayName("Actif").type("boolean").nullable(false).editable(true).build(),
                EntityMetadata.FieldMetadata.builder().name("createdAt").displayName("Créé le").type("date").editable(false).build(),
                EntityMetadata.FieldMetadata.builder().name("updatedAt").displayName("Modifié le").type("date").editable(false).build()
            ))
            .build();
    }

    private Map<String, Object> getUserData(Pageable pageable) {
        Page<User> page = userRepository.findAll(pageable);
        return Map.of(
            "data", page.getContent().stream().map(this::mapUserToDto).collect(Collectors.toList()),
            "totalElements", page.getTotalElements(),
            "totalPages", page.getTotalPages(),
            "currentPage", page.getNumber()
        );
    }

    private AdminUserDto getUserById(Long id) {
        return userRepository.findById(id)
            .map(this::mapUserToDto)
            .orElseThrow(() -> new NoSuchElementException("User not found: " + id));
    }

    private AdminUserDto updateUser(Long id, Map<String, Object> updates) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new NoSuchElementException("User not found: " + id));

        if (updates.containsKey("username")) user.setUsername((String) updates.get("username"));
        if (updates.containsKey("email")) user.setEmail((String) updates.get("email"));
        if (updates.containsKey("role")) user.setRole(User.UserRole.valueOf((String) updates.get("role")));
        if (updates.containsKey("avatarUrl")) user.setAvatarUrl((String) updates.get("avatarUrl"));
        if (updates.containsKey("bio")) user.setBio((String) updates.get("bio"));
        if (updates.containsKey("location")) user.setLocation((String) updates.get("location"));
        if (updates.containsKey("isVerified")) user.setIsVerified((Boolean) updates.get("isVerified"));
        if (updates.containsKey("isActive")) user.setIsActive((Boolean) updates.get("isActive"));

        user = userRepository.save(user);
        log.info("User updated: {}", user.getId());
        return mapUserToDto(user);
    }

    private AdminUserDto mapUserToDto(User user) {
        return AdminUserDto.builder()
            .id(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .role(user.getRole())
            .avatarUrl(user.getAvatarUrl())
            .bio(user.getBio())
            .location(user.getLocation())
            .isVerified(user.getIsVerified())
            .isActive(user.getIsActive())
            .createdAt(user.getCreatedAt())
            .updatedAt(user.getUpdatedAt())
            .build();
    }

    // ==================== COFFEE METHODS ====================

    private EntityMetadata getCoffeeMetadata() {
        return EntityMetadata.builder()
            .name("coffees")
            .displayName("Cafés")
            .tableName("coffees")
            .fields(Arrays.asList(
                EntityMetadata.FieldMetadata.builder().name("id").displayName("ID").type("number").primaryKey(true).editable(false).build(),
                EntityMetadata.FieldMetadata.builder().name("name").displayName("Nom").type("string").nullable(false).editable(true).build(),
                EntityMetadata.FieldMetadata.builder().name("roasterId").displayName("Torréfacteur").type("relation").nullable(true).editable(true)
                    .relation(EntityMetadata.RelationInfo.builder().entityType("roasters").displayField("name").build()).build(),
                EntityMetadata.FieldMetadata.builder().name("origin").displayName("Origine").type("string").nullable(true).editable(true).build(),
                EntityMetadata.FieldMetadata.builder().name("process").displayName("Process").type("string").nullable(true).editable(true).build(),
                EntityMetadata.FieldMetadata.builder().name("variety").displayName("Variété").type("string").nullable(true).editable(true).build(),
                EntityMetadata.FieldMetadata.builder().name("priceRange").displayName("Gamme de prix").type("string").nullable(true).editable(true).build(),
                EntityMetadata.FieldMetadata.builder().name("status").displayName("Statut").type("enum").nullable(false).editable(true)
                    .enumValues(Arrays.asList("PENDING", "APPROVED", "REJECTED")).build(),
                EntityMetadata.FieldMetadata.builder().name("averageRating").displayName("Note moyenne").type("number").editable(false).build(),
                EntityMetadata.FieldMetadata.builder().name("reviewCount").displayName("Nombre d'avis").type("number").editable(false).build(),
                EntityMetadata.FieldMetadata.builder().name("createdAt").displayName("Créé le").type("date").editable(false).build()
            ))
            .build();
    }

    private Map<String, Object> getCoffeeData(Pageable pageable) {
        Page<Coffee> page = coffeeRepository.findAll(pageable);
        return Map.of(
            "data", page.getContent().stream().map(this::mapCoffeeToDto).collect(Collectors.toList()),
            "totalElements", page.getTotalElements(),
            "totalPages", page.getTotalPages(),
            "currentPage", page.getNumber()
        );
    }

    private AdminCoffeeDto getCoffeeById(Long id) {
        return coffeeRepository.findById(id)
            .map(this::mapCoffeeToDto)
            .orElseThrow(() -> new NoSuchElementException("Coffee not found: " + id));
    }

    private AdminCoffeeDto updateCoffee(Long id, Map<String, Object> updates) {
        Coffee coffee = coffeeRepository.findById(id)
            .orElseThrow(() -> new NoSuchElementException("Coffee not found: " + id));

        if (updates.containsKey("name")) coffee.setName((String) updates.get("name"));
        if (updates.containsKey("roasterId")) {
            Long roasterId = ((Number) updates.get("roasterId")).longValue();
            Roaster roaster = roasterRepository.findById(roasterId).orElse(null);
            coffee.setRoaster(roaster);
        }
        if (updates.containsKey("origin")) coffee.setOrigin((String) updates.get("origin"));
        if (updates.containsKey("process")) coffee.setProcess((String) updates.get("process"));
        if (updates.containsKey("variety")) coffee.setVariety((String) updates.get("variety"));
        if (updates.containsKey("priceRange")) coffee.setPriceRange((String) updates.get("priceRange"));
        if (updates.containsKey("description")) coffee.setDescription((String) updates.get("description"));
        if (updates.containsKey("status")) coffee.setStatus(Coffee.CoffeeStatus.valueOf((String) updates.get("status")));

        coffee = coffeeRepository.save(coffee);
        log.info("Coffee updated: {}", coffee.getId());
        return mapCoffeeToDto(coffee);
    }

    private AdminCoffeeDto mapCoffeeToDto(Coffee coffee) {
        return AdminCoffeeDto.builder()
            .id(coffee.getId())
            .name(coffee.getName())
            .roasterId(coffee.getRoaster() != null ? coffee.getRoaster().getId() : null)
            .roasterName(coffee.getRoaster() != null ? coffee.getRoaster().getName() : null)
            .origin(coffee.getOrigin())
            .process(coffee.getProcess())
            .variety(coffee.getVariety())
            .altitudeMin(coffee.getAltitudeMin())
            .altitudeMax(coffee.getAltitudeMax())
            .harvestYear(coffee.getHarvestYear())
            .priceRange(coffee.getPriceRange())
            .description(coffee.getDescription())
            .imageUrl(coffee.getImageUrl())
            .averageRating(coffee.getAverageRating())
            .reviewCount(coffee.getReviewCount())
            .status(coffee.getStatus())
            .submittedById(coffee.getSubmittedBy() != null ? coffee.getSubmittedBy().getId() : null)
            .submittedByUsername(coffee.getSubmittedBy() != null ? coffee.getSubmittedBy().getUsername() : null)
            .moderatedById(coffee.getModeratedBy() != null ? coffee.getModeratedBy().getId() : null)
            .moderatedByUsername(coffee.getModeratedBy() != null ? coffee.getModeratedBy().getUsername() : null)
            .moderationReason(coffee.getModerationReason())
            .createdAt(coffee.getCreatedAt())
            .updatedAt(coffee.getUpdatedAt())
            .moderatedAt(coffee.getModeratedAt())
            .noteIds(coffee.getNotes() != null ? coffee.getNotes().stream().map(Note::getId).collect(Collectors.toList()) : null)
            .noteNames(coffee.getNotes() != null ? coffee.getNotes().stream().map(Note::getName).collect(Collectors.toList()) : null)
            .build();
    }

    // ==================== ROASTER METHODS ====================

    private EntityMetadata getRoasterMetadata() {
        return EntityMetadata.builder()
            .name("roasters")
            .displayName("Torréfacteurs")
            .tableName("roasters")
            .fields(Arrays.asList(
                EntityMetadata.FieldMetadata.builder().name("id").displayName("ID").type("number").primaryKey(true).editable(false).build(),
                EntityMetadata.FieldMetadata.builder().name("name").displayName("Nom").type("string").nullable(false).editable(true).build(),
                EntityMetadata.FieldMetadata.builder().name("description").displayName("Description").type("string").nullable(true).editable(true).build(),
                EntityMetadata.FieldMetadata.builder().name("location").displayName("Localisation").type("string").nullable(true).editable(true).build(),
                EntityMetadata.FieldMetadata.builder().name("website").displayName("Site web").type("string").nullable(true).editable(true).build(),
                EntityMetadata.FieldMetadata.builder().name("logoUrl").displayName("Logo").type("string").nullable(true).editable(true).build(),
                EntityMetadata.FieldMetadata.builder().name("isVerified").displayName("Vérifié").type("boolean").nullable(false).editable(true).build(),
                EntityMetadata.FieldMetadata.builder().name("createdAt").displayName("Créé le").type("date").editable(false).build()
            ))
            .build();
    }

    private Map<String, Object> getRoasterData(Pageable pageable) {
        Page<Roaster> page = roasterRepository.findAll(pageable);
        return Map.of(
            "data", page.getContent().stream().map(this::mapRoasterToDto).collect(Collectors.toList()),
            "totalElements", page.getTotalElements(),
            "totalPages", page.getTotalPages(),
            "currentPage", page.getNumber()
        );
    }

    private AdminRoasterDto getRoasterById(Long id) {
        return roasterRepository.findById(id)
            .map(this::mapRoasterToDto)
            .orElseThrow(() -> new NoSuchElementException("Roaster not found: " + id));
    }

    private AdminRoasterDto updateRoaster(Long id, Map<String, Object> updates) {
        Roaster roaster = roasterRepository.findById(id)
            .orElseThrow(() -> new NoSuchElementException("Roaster not found: " + id));

        if (updates.containsKey("name")) roaster.setName((String) updates.get("name"));
        if (updates.containsKey("description")) roaster.setDescription((String) updates.get("description"));
        if (updates.containsKey("location")) roaster.setLocation((String) updates.get("location"));
        if (updates.containsKey("website")) roaster.setWebsite((String) updates.get("website"));
        if (updates.containsKey("logoUrl")) roaster.setLogoUrl((String) updates.get("logoUrl"));
        if (updates.containsKey("isVerified")) roaster.setIsVerified((Boolean) updates.get("isVerified"));

        roaster = roasterRepository.save(roaster);
        log.info("Roaster updated: {}", roaster.getId());
        return mapRoasterToDto(roaster);
    }

    private AdminRoasterDto mapRoasterToDto(Roaster roaster) {
        return AdminRoasterDto.builder()
            .id(roaster.getId())
            .name(roaster.getName())
            .description(roaster.getDescription())
            .location(roaster.getLocation())
            .website(roaster.getWebsite())
            .logoUrl(roaster.getLogoUrl())
            .isVerified(roaster.getIsVerified())
            .createdAt(roaster.getCreatedAt())
            .updatedAt(roaster.getUpdatedAt())
            .build();
    }

    // ==================== NOTE METHODS ====================

    private EntityMetadata getNoteMetadata() {
        return EntityMetadata.builder()
            .name("notes")
            .displayName("Notes de dégustation")
            .tableName("notes")
            .fields(Arrays.asList(
                EntityMetadata.FieldMetadata.builder().name("id").displayName("ID").type("number").primaryKey(true).editable(false).build(),
                EntityMetadata.FieldMetadata.builder().name("name").displayName("Nom").type("string").nullable(false).editable(true).build(),
                EntityMetadata.FieldMetadata.builder().name("category").displayName("Catégorie").type("string").nullable(true).editable(true).build(),
                EntityMetadata.FieldMetadata.builder().name("createdAt").displayName("Créé le").type("date").editable(false).build()
            ))
            .build();
    }

    private Map<String, Object> getNoteData(Pageable pageable) {
        Page<Note> page = noteRepository.findAll(pageable);
        return Map.of(
            "data", page.getContent().stream().map(this::mapNoteToDto).collect(Collectors.toList()),
            "totalElements", page.getTotalElements(),
            "totalPages", page.getTotalPages(),
            "currentPage", page.getNumber()
        );
    }

    private AdminNoteDto getNoteById(Long id) {
        return noteRepository.findById(id)
            .map(this::mapNoteToDto)
            .orElseThrow(() -> new NoSuchElementException("Note not found: " + id));
    }

    private AdminNoteDto updateNote(Long id, Map<String, Object> updates) {
        Note note = noteRepository.findById(id)
            .orElseThrow(() -> new NoSuchElementException("Note not found: " + id));

        if (updates.containsKey("name")) note.setName((String) updates.get("name"));
        if (updates.containsKey("category")) note.setCategory((String) updates.get("category"));

        note = noteRepository.save(note);
        log.info("Note updated: {}", note.getId());
        return mapNoteToDto(note);
    }

    private AdminNoteDto mapNoteToDto(Note note) {
        return AdminNoteDto.builder()
            .id(note.getId())
            .name(note.getName())
            .category(note.getCategory())
            .createdAt(note.getCreatedAt())
            .build();
    }

    // ==================== REVIEW METHODS ====================

    private EntityMetadata getReviewMetadata() {
        return EntityMetadata.builder()
            .name("reviews")
            .displayName("Avis")
            .tableName("reviews")
            .fields(Arrays.asList(
                EntityMetadata.FieldMetadata.builder().name("id").displayName("ID").type("number").primaryKey(true).editable(false).build(),
                EntityMetadata.FieldMetadata.builder().name("coffeeId").displayName("Café").type("relation").nullable(false).editable(false)
                    .relation(EntityMetadata.RelationInfo.builder().entityType("coffees").displayField("name").build()).build(),
                EntityMetadata.FieldMetadata.builder().name("userId").displayName("Utilisateur").type("relation").nullable(false).editable(false)
                    .relation(EntityMetadata.RelationInfo.builder().entityType("users").displayField("username").build()).build(),
                EntityMetadata.FieldMetadata.builder().name("rating").displayName("Note").type("number").nullable(false).editable(true).build(),
                EntityMetadata.FieldMetadata.builder().name("comment").displayName("Commentaire").type("string").nullable(false).editable(true).build(),
                EntityMetadata.FieldMetadata.builder().name("brewMethod").displayName("Méthode").type("string").nullable(true).editable(true).build(),
                EntityMetadata.FieldMetadata.builder().name("helpfulCount").displayName("Utile").type("number").editable(false).build(),
                EntityMetadata.FieldMetadata.builder().name("createdAt").displayName("Créé le").type("date").editable(false).build()
            ))
            .build();
    }

    private Map<String, Object> getReviewData(Pageable pageable) {
        Page<Review> page = reviewRepository.findAll(pageable);
        return Map.of(
            "data", page.getContent().stream().map(this::mapReviewToDto).collect(Collectors.toList()),
            "totalElements", page.getTotalElements(),
            "totalPages", page.getTotalPages(),
            "currentPage", page.getNumber()
        );
    }

    private AdminReviewDto getReviewById(Long id) {
        return reviewRepository.findById(id)
            .map(this::mapReviewToDto)
            .orElseThrow(() -> new NoSuchElementException("Review not found: " + id));
    }

    private AdminReviewDto updateReview(Long id, Map<String, Object> updates) {
        Review review = reviewRepository.findById(id)
            .orElseThrow(() -> new NoSuchElementException("Review not found: " + id));

        if (updates.containsKey("rating")) {
            Object rating = updates.get("rating");
            if (rating instanceof Number) {
                review.setRating(((Number) rating).shortValue());
            }
        }
        if (updates.containsKey("comment")) review.setComment((String) updates.get("comment"));
        if (updates.containsKey("brewMethod")) review.setBrewMethod((String) updates.get("brewMethod"));

        review = reviewRepository.save(review);
        log.info("Review updated: {}", review.getId());
        return mapReviewToDto(review);
    }

    private AdminReviewDto mapReviewToDto(Review review) {
        return AdminReviewDto.builder()
            .id(review.getId())
            .coffeeId(review.getCoffee() != null ? review.getCoffee().getId() : null)
            .coffeeName(review.getCoffee() != null ? review.getCoffee().getName() : null)
            .userId(review.getUser() != null ? review.getUser().getId() : null)
            .username(review.getUser() != null ? review.getUser().getUsername() : null)
            .rating(review.getRating())
            .comment(review.getComment())
            .brewMethod(review.getBrewMethod())
            .helpfulCount(review.getHelpfulCount())
            .notHelpfulCount(review.getNotHelpfulCount())
            .createdAt(review.getCreatedAt())
            .updatedAt(review.getUpdatedAt())
            .build();
    }

    // ==================== REPORT METHODS ====================

    private EntityMetadata getReportMetadata() {
        return EntityMetadata.builder()
            .name("reports")
            .displayName("Signalements")
            .tableName("reports")
            .fields(Arrays.asList(
                EntityMetadata.FieldMetadata.builder().name("id").displayName("ID").type("number").primaryKey(true).editable(false).build(),
                EntityMetadata.FieldMetadata.builder().name("reporterId").displayName("Rapporteur").type("relation").nullable(false).editable(false)
                    .relation(EntityMetadata.RelationInfo.builder().entityType("users").displayField("username").build()).build(),
                EntityMetadata.FieldMetadata.builder().name("entityType").displayName("Type d'entité").type("string").nullable(false).editable(false).build(),
                EntityMetadata.FieldMetadata.builder().name("entityId").displayName("ID de l'entité").type("number").nullable(false).editable(false).build(),
                EntityMetadata.FieldMetadata.builder().name("reason").displayName("Raison").type("string").nullable(false).editable(true).build(),
                EntityMetadata.FieldMetadata.builder().name("status").displayName("Statut").type("enum").nullable(false).editable(true)
                    .enumValues(Arrays.asList("PENDING", "RESOLVED")).build(),
                EntityMetadata.FieldMetadata.builder().name("adminNotes").displayName("Notes admin").type("string").nullable(true).editable(true).build(),
                EntityMetadata.FieldMetadata.builder().name("createdAt").displayName("Créé le").type("date").editable(false).build()
            ))
            .build();
    }

    private Map<String, Object> getReportData(Pageable pageable) {
        Page<Report> page = reportRepository.findAll(pageable);
        return Map.of(
            "data", page.getContent().stream().map(this::mapReportToDto).collect(Collectors.toList()),
            "totalElements", page.getTotalElements(),
            "totalPages", page.getTotalPages(),
            "currentPage", page.getNumber()
        );
    }

    private AdminReportDto getReportById(Long id) {
        return reportRepository.findById(id)
            .map(this::mapReportToDto)
            .orElseThrow(() -> new NoSuchElementException("Report not found: " + id));
    }

    private AdminReportDto updateReport(Long id, Map<String, Object> updates) {
        Report report = reportRepository.findById(id)
            .orElseThrow(() -> new NoSuchElementException("Report not found: " + id));

        if (updates.containsKey("reason")) report.setReason((String) updates.get("reason"));
        if (updates.containsKey("adminNotes")) report.setAdminNotes((String) updates.get("adminNotes"));

        report = reportRepository.save(report);
        log.info("Report updated: {}", report.getId());
        return mapReportToDto(report);
    }

    private AdminReportDto mapReportToDto(Report report) {
        return AdminReportDto.builder()
            .id(report.getId())
            .reporterId(report.getReporter() != null ? report.getReporter().getId() : null)
            .reporterUsername(report.getReporter() != null ? report.getReporter().getUsername() : null)
            .entityType(report.getEntityType())
            .entityId(report.getEntityId())
            .reason(report.getReason())
            .description(report.getDescription())
            .status(report.getStatus())
            .resolvedById(report.getResolvedBy() != null ? report.getResolvedBy().getId() : null)
            .resolvedByUsername(report.getResolvedBy() != null ? report.getResolvedBy().getUsername() : null)
            .adminNotes(report.getAdminNotes())
            .resolvedAt(report.getResolvedAt())
            .createdAt(report.getCreatedAt())
            .build();
    }

    // ==================== ACTIVITY METHODS ====================

    private EntityMetadata getActivityMetadata() {
        return EntityMetadata.builder()
            .name("activities")
            .displayName("Activités")
            .tableName("activities")
            .fields(Arrays.asList(
                EntityMetadata.FieldMetadata.builder().name("id").displayName("ID").type("number").primaryKey(true).editable(false).build(),
                EntityMetadata.FieldMetadata.builder().name("type").displayName("Type").type("string").nullable(false).editable(false).build(),
                EntityMetadata.FieldMetadata.builder().name("message").displayName("Message").type("string").nullable(false).editable(false).build(),
                EntityMetadata.FieldMetadata.builder().name("userId").displayName("Utilisateur").type("relation").nullable(true).editable(false)
                    .relation(EntityMetadata.RelationInfo.builder().entityType("users").displayField("username").build()).build(),
                EntityMetadata.FieldMetadata.builder().name("coffeeId").displayName("Café").type("relation").nullable(true).editable(false)
                    .relation(EntityMetadata.RelationInfo.builder().entityType("coffees").displayField("name").build()).build(),
                EntityMetadata.FieldMetadata.builder().name("createdAt").displayName("Créé le").type("date").editable(false).build()
            ))
            .build();
    }

    private Map<String, Object> getActivityData(Pageable pageable) {
        Page<Activity> page = activityRepository.findAll(pageable);
        return Map.of(
            "data", page.getContent().stream().map(this::mapActivityToDto).collect(Collectors.toList()),
            "totalElements", page.getTotalElements(),
            "totalPages", page.getTotalPages(),
            "currentPage", page.getNumber()
        );
    }

    private AdminActivityDto getActivityById(Long id) {
        return activityRepository.findById(id)
            .map(this::mapActivityToDto)
            .orElseThrow(() -> new NoSuchElementException("Activity not found: " + id));
    }

    private AdminActivityDto mapActivityToDto(Activity activity) {
        return AdminActivityDto.builder()
            .id(activity.getId())
            .type(activity.getType())
            .message(activity.getMessage())
            .userId(activity.getUser() != null ? activity.getUser().getId() : null)
            .username(activity.getUser() != null ? activity.getUser().getUsername() : null)
            .coffeeId(activity.getCoffee() != null ? activity.getCoffee().getId() : null)
            .coffeeName(activity.getCoffee() != null ? activity.getCoffee().getName() : null)
            .createdAt(activity.getCreatedAt())
            .build();
    }
}
