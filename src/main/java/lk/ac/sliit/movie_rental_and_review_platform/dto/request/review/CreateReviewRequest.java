package lk.ac.sliit.movie_rental_and_review_platform.dto.request.review;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateReviewRequest {
    private Long movieId;
    private Integer rating;
    private String comment;
}
