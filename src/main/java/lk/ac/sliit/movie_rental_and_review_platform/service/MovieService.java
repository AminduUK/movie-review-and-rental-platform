package lk.ac.sliit.movie_rental_and_review_platform.service;

import lk.ac.sliit.movie_rental_and_review_platform.dto.request.movie.CreateMovieRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.request.movie.UpdateMovieRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.response.movie.MovieResponse;
import java.util.List;

public interface MovieService {

    MovieResponse addMovie(CreateMovieRequest request);

    MovieResponse updateMovie(UpdateMovieRequest updateRequest);

    void deleteMovie(Long movieId);

    List<MovieResponse> searchMovieByTitle(String title);

    List<MovieResponse> getMoviesByCategory(Long categoryId);

    List<MovieResponse> getMoviesByYear(Integer releaseYear);

    List<MovieResponse> getAllMovies();
}
