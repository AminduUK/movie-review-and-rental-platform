package lk.ac.sliit.movie_rental_and_review_platform.controller.user;

import lk.ac.sliit.movie_rental_and_review_platform.dto.request.review.UpdateReviewRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.response.review.ReviewResponse;
import lk.ac.sliit.movie_rental_and_review_platform.stripe.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user/review")
public class UserReviewController {

    private final ReviewService reviewService;

    // Add a review
    @PostMapping("/add-review")
    public ResponseEntity<ReviewResponse> addReview(@RequestBody CreateReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.addReview(getLoggedInUserId(), request));
    }

    // Update a review
    @PutMapping("/update-review")
    public ResponseEntity<ReviewResponse> updateReview(@RequestBody UpdateReviewRequest request) {
        return ResponseEntity.ok(reviewService.updateReview(getLoggedInUserId(), request));
    }

    // Delete a review
    @DeleteMapping("/delete-review/{reviewId}")
    public ResponseEntity<String> deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReview(getLoggedInUserId(), reviewId);
        return ResponseEntity.ok("Review deleted successfully");
    }

    // Get logged userId
    private Long getLoggedInUserId() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getUserId();
    }

}
