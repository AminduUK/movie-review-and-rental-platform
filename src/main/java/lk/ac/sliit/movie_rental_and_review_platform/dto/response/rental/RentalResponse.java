package lk.ac.sliit.movie_rental_and_review_platform.dto.response.rental;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RentalResponse {
    private Long rentalId;
    private String movieTitle;
    private String posterUrl;
    private LocalDateTime rentalDate;
    private LocalDateTime dueDate;
    private LocalDateTime returnDate;
    private String rentalStatus;
    private String paymentStatus;
    private Double amountPaid;
}
