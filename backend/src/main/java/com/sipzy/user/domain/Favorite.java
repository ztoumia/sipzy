package com.sipzy.user.domain;

import com.sipzy.coffee.domain.Coffee;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

/**
 * Favorite entity - Represents a user's favorite coffee
 */
@Entity
@Table(name = "favorites",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "coffee_id"}),
    indexes = {
        @Index(name = "idx_favorites_user_id", columnList = "user_id"),
        @Index(name = "idx_favorites_coffee_id", columnList = "coffee_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Favorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coffee_id", nullable = false)
    private Coffee coffee;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
