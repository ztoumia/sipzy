package com.sipzy.review.domain;

import com.sipzy.user.domain.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

/**
 * ReviewVote entity - Tracks helpful/not helpful votes on reviews
 */
@Entity
@Table(name = "review_votes",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_review_votes_user_review",
        columnNames = {"user_id", "review_id"}
    )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewVote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Boolean isHelpful;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
