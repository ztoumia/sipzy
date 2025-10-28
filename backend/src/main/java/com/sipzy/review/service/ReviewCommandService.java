package com.sipzy.review.service;

import com.sipzy.coffee.domain.Coffee;
import com.sipzy.coffee.repository.CoffeeRepository;
import com.sipzy.common.exception.ConflictException;
import com.sipzy.common.exception.ForbiddenException;
import com.sipzy.common.exception.ResourceNotFoundException;
import com.sipzy.review.domain.Review;
import com.sipzy.review.domain.ReviewVote;
import com.sipzy.review.dto.request.CreateReviewRequest;
import com.sipzy.review.dto.request.VoteReviewRequest;
import com.sipzy.review.dto.response.ReviewResponse;
import com.sipzy.review.dto.response.ReviewVoteResponse;
import com.sipzy.review.mapper.ReviewMapper;
import com.sipzy.review.repository.ReviewRepository;
import com.sipzy.review.repository.ReviewVoteRepository;
import com.sipzy.user.domain.User;
import com.sipzy.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Review Command Service (CQRS Write Side)
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ReviewCommandService {

    private final ReviewRepository reviewRepository;
    private final ReviewVoteRepository reviewVoteRepository;
    private final CoffeeRepository coffeeRepository;
    private final UserRepository userRepository;
    private final ReviewMapper reviewMapper;

    public ReviewResponse createReview(CreateReviewRequest request, Long userId) {
        log.info("Creating review for coffee id: {} by user: {}", request.getCoffeeId(), userId);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Coffee coffee = coffeeRepository.findById(request.getCoffeeId())
            .orElseThrow(() -> new ResourceNotFoundException("Coffee not found with id: " + request.getCoffeeId()));

        // Check if user already reviewed this coffee
        if (reviewRepository.existsByCoffeeIdAndUserId(request.getCoffeeId(), userId)) {
            throw new ConflictException("You have already reviewed this coffee");
        }

        Review review = Review.builder()
            .coffee(coffee)
            .user(user)
            .rating(request.getRating().shortValue())
            .comment(request.getComment())
            .build();

        review = reviewRepository.save(review);
        log.info("Review created with id: {}", review.getId());

        return reviewMapper.toReviewResponse(review);
    }

    public ReviewResponse updateReview(Long reviewId, CreateReviewRequest request, Long userId) {
        log.info("Updating review id: {} by user: {}", reviewId, userId);

        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!review.canBeEditedBy(user)) {
            throw new ForbiddenException("You don't have permission to edit this review");
        }

        review.updateRating(request.getRating());
        review.updateComment(request.getComment());

        review = reviewRepository.save(review);
        log.info("Review updated: {}", review.getId());

        return reviewMapper.toReviewResponse(review);
    }

    public void deleteReview(Long reviewId, Long userId) {
        log.info("Deleting review id: {} by user: {}", reviewId, userId);

        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!review.canBeDeletedBy(user)) {
            throw new ForbiddenException("You don't have permission to delete this review");
        }

        reviewRepository.delete(review);
        log.info("Review deleted: {}", reviewId);
    }

    public ReviewVoteResponse voteReview(Long reviewId, VoteReviewRequest request, Long userId) {
        log.info("Voting on review id: {} by user: {}, isHelpful: {}", reviewId, userId, request.isHelpful());

        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check if user already voted
        Optional<ReviewVote> existingVote = reviewVoteRepository.findByReviewIdAndUserId(reviewId, userId);

        if (existingVote.isPresent()) {
            ReviewVote vote = existingVote.get();

            // If same vote, remove it (toggle behavior)
            if (vote.getIsHelpful().equals(request.isHelpful())) {
                // Remove vote
                if (vote.getIsHelpful()) {
                    review.decrementHelpfulCount();
                } else {
                    review.decrementNotHelpfulCount();
                }
                reviewVoteRepository.delete(vote);
            } else {
                // Change vote
                if (vote.getIsHelpful()) {
                    review.decrementHelpfulCount();
                    review.incrementNotHelpfulCount();
                } else {
                    review.decrementNotHelpfulCount();
                    review.incrementHelpfulCount();
                }
                vote.setIsHelpful(request.isHelpful());
                reviewVoteRepository.save(vote);
            }
        } else {
            // New vote
            ReviewVote newVote = ReviewVote.builder()
                .review(review)
                .user(user)
                .isHelpful(request.isHelpful())
                .build();

            if (request.isHelpful()) {
                review.incrementHelpfulCount();
            } else {
                review.incrementNotHelpfulCount();
            }

            reviewVoteRepository.save(newVote);
        }

        reviewRepository.save(review);
        log.info("Vote processed for review: {}", reviewId);

        return new ReviewVoteResponse(
            reviewId,
            request.isHelpful(),
            review.getHelpfulCount(),
            review.getNotHelpfulCount()
        );
    }
}
