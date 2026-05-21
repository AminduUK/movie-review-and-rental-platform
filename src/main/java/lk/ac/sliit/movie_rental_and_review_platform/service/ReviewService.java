package lk.ac.sliit.movie_rental_and_review_platform.service;

import lk.ac.sliit.movie_rental_and_review_platform.dto.request.review.CreateReviewRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.request.review.UpdateReviewRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.response.review.ReviewResponse;
import java.util.List;

public interface ReviewService {

    ReviewResponse addReview(Long userId, CreateReviewRequest request);

    ReviewResponse updateReview(Long userId, UpdateReviewRequest request);

    void deleteReview(Long userId, Long reviewId);

    List<ReviewResponse> getReviewsByMovie(Long movieId);

}
