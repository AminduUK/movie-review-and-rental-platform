package lk.ac.sliit.movie_rental_and_review_platform.controller.rental;

import lk.ac.sliit.movie_rental_and_review_platform.dto.request.rental.CreateRentalRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.response.rental.RentalResponse;
import lk.ac.sliit.movie_rental_and_review_platform.security.CustomUserDetails;
import lk.ac.sliit.movie_rental_and_review_platform.service.RentalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user/rental")
public class RentalController {

    private final RentalService rentalService;

    @PostMapping("/add-rental")
    public ResponseEntity<RentalResponse> rentMovie(@RequestBody CreateRentalRequest createRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rentalService.rentMovie(getLoggedInUserId(), createRequest));
    }

    private Long getLoggedInUserId() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getUserId();
    }
}
