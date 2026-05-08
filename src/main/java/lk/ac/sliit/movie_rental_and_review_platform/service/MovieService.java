package lk.ac.sliit.movie_rental_and_review_platform.service;

import lk.ac.sliit.movie_rental_and_review_platform.dto.request.movie.CreateMovieRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.response.movie.MovieResponse;

public interface MovieService {

    MovieResponse addMovie(CreateMovieRequest request);

}
