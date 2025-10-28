package com.sipzy.review.domain;

import com.sipzy.coffee.domain.Coffee;
import com.sipzy.user.domain.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

/**
 * Review entity - User reviews for coffees
 */
@Entity
@Table(name = "reviews", indexes = {
        @Index(name = "idx_reviews_coffee_id", columnList = "coffee_id"),
        @Index(name = "idx_reviews_user_id", columnList = "user_id"),
        @Index(name = "idx_reviews_created_at", columnList = "createdAt")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_reviews_user_coffee", columnNames = {"user_id", "coffee_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coffee_id", nullable = false)
    private Coffee coffee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Short rating;

    @Column(length = 2000, nullable = false)
    private String comment;

    @Column(name = "brew_method", length = 50)
    private String brewMethod;

    @Column(name = "helpful_count")
    @Builder.Default
    private Integer helpfulCount = 0;

    @Column(name = "not_helpful_count")
    @Builder.Default
    private Integer notHelpfulCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    // Business methods
    public void updateRating(Short newRating) {
        this.rating = newRating;
    }

    public void updateRating(Integer newRating) {
        this.rating = newRating.shortValue();
    }

    public void updateComment(String newComment) {
        this.comment = newComment;
    }

    public void incrementHelpfulCount() {
        this.helpfulCount++;
    }

    public void decrementHelpfulCount() {
        if (this.helpfulCount > 0) {
            this.helpfulCount--;
        }
    }

    public void incrementNotHelpfulCount() {
        this.notHelpfulCount++;
    }

    public void decrementNotHelpfulCount() {
        if (this.notHelpfulCount > 0) {
            this.notHelpfulCount--;
        }
    }

    public boolean canBeEditedBy(User currentUser) {
        if (currentUser == null) {
            return false;
        }
        return user.getId().equals(currentUser.getId()) || currentUser.isAdmin();
    }

    public boolean canBeDeletedBy(User currentUser) {
        return canBeEditedBy(currentUser);
    }
}
