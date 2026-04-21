package lk.ac.sliit.movie_rental_and_review_platform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentResponse {

    private Long paymentId;
    private Double amount;
    private String status;
    private String paymentMethod;
}
