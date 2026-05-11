package lk.ac.sliit.movie_rental_and_review_platform.controller.user;

import lk.ac.sliit.movie_rental_and_review_platform.dto.response.watchlist.WatchlistResponse;
import lk.ac.sliit.movie_rental_and_review_platform.stripe.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user/watchlist")
public class UserWatchlistController {

    private final WatchlistService watchlistService;

    // Get watchlist
    @GetMapping("/get-watchlist")
    public ResponseEntity<WatchlistResponse> getWatchlist() {
        return ResponseEntity.ok(watchlistService.getWatchlist(getLoggedInUserId()));
    }

    // Add movie to watchlist
    @PostMapping("/add-movie/{movieId}")
    public ResponseEntity<WatchlistResponse> addMovie(@PathVariable Long movieId) {
        return ResponseEntity.ok(watchlistService.addMovie(getLoggedInUserId(), movieId));
    }

    // Remove movie from watchlist
    @DeleteMapping("/remove-movie/{movieId}")
    public ResponseEntity<WatchlistResponse> removeMovie(@PathVariable Long movieId) {
        return ResponseEntity.ok(watchlistService.removeMovie(getLoggedInUserId(), movieId));
    }

    // Get logged userId
    private Long getLoggedInUserId() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getUserId();
    }
}