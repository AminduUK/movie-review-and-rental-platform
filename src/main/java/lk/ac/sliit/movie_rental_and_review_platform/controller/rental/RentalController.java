package lk.ac.sliit.movie_rental_and_review_platform.controller.rental;

import lk.ac.sliit.movie_rental_and_review_platform.dto.request.rental.CreateRentalRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.response.rental.RentalResponse;
import lk.ac.sliit.movie_rental_and_review_platform.service.RentalService;
import lk.ac.sliit.movie_rental_and_review_platform.stripe.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user/rental")
public class RentalController {

    private final RentalService rentalService;

    // Add new rentals
    @PostMapping("/add-rental")
    public ResponseEntity<RentalResponse> rentMovie(@RequestBody CreateRentalRequest createRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rentalService.rentMovie(getLoggedInUserId(), createRequest));
    }

    // View currently renting movies
    @GetMapping("/get-active-rentals")
    public ResponseEntity<List<RentalResponse>> getActiveRentals() {
        return ResponseEntity.ok(rentalService.getActiveRentals(getLoggedInUserId()));
    }

    // View watch history
    @GetMapping("/get-rental-history")
    public ResponseEntity<List<RentalResponse>> getRentalHistory() {
        return ResponseEntity.ok(rentalService.getRentalHistory(getLoggedInUserId()));
    }

    // Return a movie manually
    @PutMapping("/return-rental/{rentalId}")
    public ResponseEntity<RentalResponse> returnMovie(@PathVariable Long rentalId) {
        return ResponseEntity.ok(rentalService.returnMovie(getLoggedInUserId(), rentalId));
    }

    // Get logged userId
    private Long getLoggedInUserId() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getUserId();
    }
}
