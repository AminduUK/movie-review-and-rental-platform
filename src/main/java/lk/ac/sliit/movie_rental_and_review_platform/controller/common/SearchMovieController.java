package lk.ac.sliit.movie_rental_and_review_platform.controller.common;

import lk.ac.sliit.movie_rental_and_review_platform.dto.response.movie.MovieResponse;
import lk.ac.sliit.movie_rental_and_review_platform.dto.response.review.ReviewResponse;
import lk.ac.sliit.movie_rental_and_review_platform.service.MovieService;
import lk.ac.sliit.movie_rental_and_review_platform.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/common/movie")
public class SearchMovieController {

    private final MovieService movieService;
    private final ReviewService reviewService;

    // Search by title
    @GetMapping("/search-by-title")
    public ResponseEntity<List<MovieResponse>> searchMovieByTitle(@RequestParam String title) {
        return ResponseEntity.ok(movieService.searchMovieByTitle(title));
    }

    // Search by category
    @GetMapping("/search-by-category/{categoryId}")
    public ResponseEntity<List<MovieResponse>> getMoviesByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(movieService.getMoviesByCategory(categoryId));
    }

    // Search by release year
    @GetMapping("/search-by-year/{releaseYear}")
    public ResponseEntity<List<MovieResponse>> getMoviesByYear(@PathVariable Integer releaseYear) {
        return ResponseEntity.ok(movieService.getMoviesByYear(releaseYear));
    }

    // Get all movies — for browsing
    @GetMapping("/get-all-movies")
    public ResponseEntity<List<MovieResponse>> getAllMovies() {
        return ResponseEntity.ok(movieService.getAllMovies());
    }

    // Get all reviews
    @GetMapping("/get-all-reviews/{movieId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByMovie(@PathVariable Long movieId) {
        return ResponseEntity.ok(reviewService.getReviewsByMovie(movieId));
    }
}