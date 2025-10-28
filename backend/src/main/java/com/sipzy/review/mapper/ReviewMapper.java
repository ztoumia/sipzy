package com.sipzy.review.mapper;

import com.sipzy.review.domain.Review;
import com.sipzy.review.dto.response.CoffeeSummary;
import com.sipzy.review.dto.response.ReviewResponse;
import com.sipzy.coffee.domain.Coffee;
import com.sipzy.coffee.domain.Roaster;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * MapStruct mapper for Review entity
 */
@Mapper(componentModel = "spring")
public interface ReviewMapper {

    @Mapping(target = "coffeeId", source = "coffee.id")
    @Mapping(target = "coffee", expression = "java(toCoffeeSummary(review.getCoffee()))")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "user", source = "user", ignore = true)
    @Mapping(target = "imageUrl", constant = "null")
    @Mapping(target = "isFlagged", constant = "false")
    ReviewResponse toReviewResponse(Review review);

    default CoffeeSummary toCoffeeSummary(Coffee coffee) {
        if (coffee == null) {
            return null;
        }
        Roaster roaster = coffee.getRoaster();
        CoffeeSummary.RoasterSummary roasterSummary = null;
        if (roaster != null) {
            roasterSummary = new CoffeeSummary.RoasterSummary(
                roaster.getId(),
                roaster.getName()
            );
        }
        return new CoffeeSummary(
            coffee.getId(),
            coffee.getName(),
            coffee.getImageUrl(),
            roasterSummary
        );
    }
}
