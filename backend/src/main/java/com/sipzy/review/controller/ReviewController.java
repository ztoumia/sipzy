package com.sipzy.review.controller;

import com.sipzy.common.dto.ApiResponse;
import com.sipzy.common.dto.PageResponse;
import com.sipzy.common.util.JwtUtil;
import com.sipzy.review.dto.request.CreateReviewRequest;
import com.sipzy.review.dto.request.VoteReviewRequest;
import com.sipzy.review.dto.response.ReviewResponse;
import com.sipzy.review.dto.response.ReviewVoteResponse;
import com.sipzy.review.service.ReviewCommandService;
import com.sipzy.review.service.ReviewQueryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller pour les avis (CQRS: séparation lecture/écriture)
 * Architecture hexagonale: Point d'entrée API (Adapter)
 */
@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Endpoints pour gérer les avis")
public class ReviewController {

    private final ReviewQueryService reviewQueryService;
    private final ReviewCommandService reviewCommandService;
    private final JwtUtil jwtUtil;

    @GetMapping("/coffees/{coffeeId}/reviews")
    @Operation(summary = "Avis d'un café", description = "Récupérer tous les avis d'un café")
    public ResponseEntity<PageResponse<ReviewResponse>> getReviewsByCoffeeId(
            @PathVariable Long coffeeId,
            @RequestParam(defaultValue = "helpful") String sortBy,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit
    ) {
        log.info("Get reviews for coffee id: {}, sortBy: {}", coffeeId, sortBy);

        PageResponse<ReviewResponse> response = reviewQueryService.getReviewsByCoffeeId(coffeeId, sortBy, page, limit);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/reviews")
    @Operation(summary = "Créer avis", description = "Créer un nouvel avis sur un café")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @Valid @RequestBody CreateReviewRequest request,
            @RequestHeader("Authorization") String authHeader
    ) {
        log.info("Create review for coffee id: {}", request.getCoffeeId());

        Long userId = jwtUtil.extractUserIdFromHeader(authHeader);
        ReviewResponse response = reviewCommandService.createReview(request, userId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response));
    }

    @PutMapping("/reviews/{id}")
    @Operation(summary = "Modifier avis", description = "Mettre à jour son avis")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReview(
            @PathVariable Long id,
            @Valid @RequestBody CreateReviewRequest request,
            @RequestHeader("Authorization") String authHeader
    ) {
        log.info("Update review id: {}", id);

        Long userId = jwtUtil.extractUserIdFromHeader(authHeader);
        ReviewResponse response = reviewCommandService.updateReview(id, request, userId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/reviews/{id}")
    @Operation(summary = "Supprimer avis", description = "Supprimer son avis")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader
    ) {
        log.info("Delete review id: {}", id);

        Long userId = jwtUtil.extractUserIdFromHeader(authHeader);
        reviewCommandService.deleteReview(id, userId);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reviews/{id}/vote")
    @Operation(summary = "Voter sur avis", description = "Voter utile/pas utile")
    public ResponseEntity<ApiResponse<ReviewVoteResponse>> voteReview(
            @PathVariable Long id,
            @Valid @RequestBody VoteReviewRequest request,
            @RequestHeader("Authorization") String authHeader
    ) {
        log.info("Vote on review id: {}, isHelpful: {}", id, request.isHelpful());

        Long userId = jwtUtil.extractUserIdFromHeader(authHeader);
        ReviewVoteResponse response = reviewCommandService.voteReview(id, request, userId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/reviews/recent")
    @Operation(summary = "Avis récents", description = "Avis récents global")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getRecentReviews(
            @RequestParam(defaultValue = "6") int limit
    ) {
        log.info("Get recent reviews, limit: {}", limit);

        List<ReviewResponse> response = reviewQueryService.getRecentReviews(limit);

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
