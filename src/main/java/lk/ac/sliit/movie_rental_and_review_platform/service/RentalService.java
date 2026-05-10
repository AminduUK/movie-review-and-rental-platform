package lk.ac.sliit.movie_rental_and_review_platform.service;

import lk.ac.sliit.movie_rental_and_review_platform.dto.request.rental.CreateRentalRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.response.rental.RentalResponse;
import java.util.List;

public interface RentalService {

    RentalResponse rentMovie(Long userId, CreateRentalRequest createRequest);

    List<RentalResponse> getActiveRentals(Long userId);

    List<RentalResponse> getRentalHistory(Long userId);

    RentalResponse returnMovie(Long userId, Long rentalId);

}
