package com.sipzy.admin.domain;

import com.sipzy.coffee.domain.Coffee;
import com.sipzy.user.domain.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

/**
 * Activity entity for admin activity log
 */
@Entity
@Table(name = "activities", indexes = {
        @Index(name = "idx_activities_type", columnList = "type"),
        @Index(name = "idx_activities_created_at", columnList = "createdAt")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ActivityType type;

    @Column(nullable = false, length = 500)
    private String message;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coffee_id")
    private Coffee coffee;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
