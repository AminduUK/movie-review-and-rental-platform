package lk.ac.sliit.movie_rental_and_review_platform.dto.request.movie;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMovieRequest {
    private Long movieId;
    private String title;
    private String description;
    private String language;
    private Integer duration;
    private Integer releaseYear;
    private String posterUrl;
    private String trailerUrl;
    private List<Long> categoryIds;
}