package lk.ac.sliit.movie_rental_and_review_platform.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentRequest {
    private Long rentalId;
    private String paymentMethod;

}
