package com.sipzy.coffee.domain;

import com.sipzy.user.domain.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Coffee entity - Core domain
 * Represents a coffee product with detailed information
 */
@Entity
@Table(name = "coffees", indexes = {
        @Index(name = "idx_coffees_status", columnList = "status"),
        @Index(name = "idx_coffees_origin", columnList = "origin"),
        @Index(name = "idx_coffees_created_at", columnList = "createdAt")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coffee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roaster_id")
    private Roaster roaster;

    @Column(length = 100)
    private String origin;

    @Column(length = 50)
    private String process;

    @Column(length = 100)
    private String variety;

    @Column(name = "altitude_min")
    private Integer altitudeMin;

    @Column(name = "altitude_max")
    private Integer altitudeMax;

    @Column(name = "harvest_year")
    private Integer harvestYear;

    @Column(name = "price_range", length = 20)
    private String priceRange;

    @Column(length = 2000)
    private String description;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "avg_rating", precision = 3, scale = 2)
    private BigDecimal averageRating;

    @Column(name = "review_count")
    @Builder.Default
    private Integer reviewCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private CoffeeStatus status = CoffeeStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by")
    private User submittedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "moderated_by")
    private User moderatedBy;

    @Column(name = "moderation_reason", length = 500)
    private String moderationReason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "moderated_at")
    private Instant moderatedAt;

    @ManyToMany
    @JoinTable(
        name = "coffee_notes",
        joinColumns = @JoinColumn(name = "coffee_id"),
        inverseJoinColumns = @JoinColumn(name = "note_id")
    )
    private java.util.List<Note> notes;

    // Enum for coffee status
    public enum CoffeeStatus {
        PENDING,
        APPROVED,
        REJECTED
    }

    // Business methods
    public boolean isPending() {
        return status == CoffeeStatus.PENDING;
    }

    public boolean isApproved() {
        return status == CoffeeStatus.APPROVED;
    }

    public boolean isRejected() {
        return status == CoffeeStatus.REJECTED;
    }

    public void approve(User moderator) {
        this.status = CoffeeStatus.APPROVED;
        this.moderatedBy = moderator;
        this.moderatedAt = Instant.now();
    }

    public void reject(User moderator, String reason) {
        this.status = CoffeeStatus.REJECTED;
        this.moderatedBy = moderator;
        this.moderationReason = reason;
        this.moderatedAt = Instant.now();
    }

    public void updateRating(BigDecimal newAverageRating, int newReviewCount) {
        this.averageRating = newAverageRating;
        this.reviewCount = newReviewCount;
    }

    public boolean canBeEditedBy(User user) {
        if (user == null) {
            return false;
        }
        return user.isAdmin() || (submittedBy != null && submittedBy.getId().equals(user.getId()));
    }
}
