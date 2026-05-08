package lk.ac.sliit.movie_rental_and_review_platform.dto.request.rental;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateRentalRequest {
    private Long movieId;
    private String paymentMethodId;
}
