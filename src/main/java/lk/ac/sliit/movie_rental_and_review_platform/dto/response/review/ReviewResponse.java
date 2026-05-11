package lk.ac.sliit.movie_rental_and_review_platform.dto.response.review;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long reviewId;
    private String movieTitle;
    private String userName;
    private Integer rating;
    private String comment;
    private LocalDateTime reviewDate;
}