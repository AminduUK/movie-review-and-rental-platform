package lk.ac.sliit.movie_rental_and_review_platform.service.impl;

import lk.ac.sliit.movie_rental_and_review_platform.dto.request.review.CreateReviewRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.request.review.UpdateReviewRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.response.review.ReviewResponse;
import lk.ac.sliit.movie_rental_and_review_platform.entity.MovieEntity;
import lk.ac.sliit.movie_rental_and_review_platform.entity.ReviewEntity;
import lk.ac.sliit.movie_rental_and_review_platform.entity.UserEntity;
import lk.ac.sliit.movie_rental_and_review_platform.repository.MovieRepository;
import lk.ac.sliit.movie_rental_and_review_platform.repository.RentalRepository;
import lk.ac.sliit.movie_rental_and_review_platform.repository.ReviewRepository;
import lk.ac.sliit.movie_rental_and_review_platform.repository.UserRepository;
import lk.ac.sliit.movie_rental_and_review_platform.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final MovieRepository movieRepository;
    private final UserRepository userRepository;
    private final RentalRepository rentalRepository;

    @Override
    public ReviewResponse addReview(Long userId, CreateReviewRequest createRequest) {

        UserEntity userEntity = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        MovieEntity movieEntity = movieRepository.findById(createRequest.getMovieId())
                .orElseThrow(() -> new RuntimeException("Movie not found"));

        // Rule 1: user must have rented this movie
        boolean hasRented = rentalRepository.existsByUserUserIdAndMovieMovieId(
                userId, createRequest.getMovieId());
        if (!hasRented) {
            throw new RuntimeException("You can only review movies you have rented");
        }

        // Rule 2: one review per movie per user
        if (reviewRepository.existsByUserUserIdAndMovieMovieId(userId, createRequest.getMovieId())) {
            throw new RuntimeException("You have already reviewed this movie");
        }

        // Rule 3: rating must be between 1 and 5
        if (createRequest.getRating() < 1 || createRequest.getRating() > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        ReviewEntity reviewEntity = new ReviewEntity();
        reviewEntity.setUser(userEntity);
        reviewEntity.setMovie(movieEntity);
        reviewEntity.setRating(createRequest.getRating());
        reviewEntity.setComment(createRequest.getComment());
        reviewEntity.setReviewDate(LocalDateTime.now());

        reviewRepository.save(reviewEntity);
        return mapToResponse(reviewEntity);
    }

    @Override
    public ReviewResponse updateReview(Long userId, UpdateReviewRequest updateRequest) {

        ReviewEntity reviewEntity = reviewRepository.findById(updateRequest.getReviewId())
                .orElseThrow(() -> new RuntimeException("Review not found"));

        // Make sure this review belongs to the logged-in user
        if (!reviewEntity.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized — this is not your review");
        }

        if (updateRequest.getComment() != null && !updateRequest.getComment().isEmpty()) {
            reviewEntity.setComment(updateRequest.getComment());
        }

        reviewRepository.save(reviewEntity);
        return mapToResponse(reviewEntity);
    }

    @Override
    public void deleteReview(Long userId, Long reviewId) {

        ReviewEntity reviewEntity = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        // make sure this review belongs to the logged-in user
        if (!reviewEntity.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized — this is not your review");
        }

        reviewRepository.delete(reviewEntity);
    }

    @Override
    public List<ReviewResponse> getReviewsByMovie(Long movieId) {

        movieRepository.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Movie not found"));

        return reviewRepository.findByMovieMovieId(movieId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ReviewResponse mapToResponse(ReviewEntity reviewEntity) {

        ReviewResponse response = new ReviewResponse();

        response.setReviewId(reviewEntity.getReviewId());
        response.setMovieTitle(reviewEntity.getMovie().getTitle());
        response.setUserName(reviewEntity.getUser().getUserName());
        response.setRating(reviewEntity.getRating());
        response.setComment(reviewEntity.getComment());
        response.setReviewDate(reviewEntity.getReviewDate());

        return response;
    }
}
