package lk.ac.sliit.movie_rental_and_review_platform.dto.response.watchlist;

import lk.ac.sliit.movie_rental_and_review_platform.dto.response.movie.MovieResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WatchlistResponse {
    private Long watchlistId;
    private List<MovieResponse> movies;
    private int totalMovies;
}
