package lk.ac.sliit.movie_rental_and_review_platform.controller.admin;

import lk.ac.sliit.movie_rental_and_review_platform.dto.request.movie.CreateMovieRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.response.movie.MovieResponse;
import lk.ac.sliit.movie_rental_and_review_platform.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/movies")
public class AdminMovieController {

    private final MovieService movieService;

    @PostMapping("/add-movie")
    public ResponseEntity<MovieResponse> addNewMovie(@RequestBody CreateMovieRequest createRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(movieService.addMovie(createRequest));
    }
}
