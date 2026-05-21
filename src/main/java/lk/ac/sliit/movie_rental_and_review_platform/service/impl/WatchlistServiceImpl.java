package lk.ac.sliit.movie_rental_and_review_platform.service.impl;

import lk.ac.sliit.movie_rental_and_review_platform.dto.response.movie.MovieResponse;
import lk.ac.sliit.movie_rental_and_review_platform.dto.response.watchlist.WatchlistResponse;
import lk.ac.sliit.movie_rental_and_review_platform.entity.CategoryEntity;
import lk.ac.sliit.movie_rental_and_review_platform.entity.MovieEntity;
import lk.ac.sliit.movie_rental_and_review_platform.entity.UserEntity;
import lk.ac.sliit.movie_rental_and_review_platform.entity.WatchlistEntity;
import lk.ac.sliit.movie_rental_and_review_platform.repository.MovieRepository;
import lk.ac.sliit.movie_rental_and_review_platform.repository.WatchlistRepository;
import lk.ac.sliit.movie_rental_and_review_platform.service.WatchlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WatchlistServiceImpl implements WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final MovieRepository movieRepository;

    // Called internally during signup — not exposed as an endpoint
    @Override
    public void createWatchlist(UserEntity user) {

        WatchlistEntity watchlist = new WatchlistEntity();
        watchlist.setUser(user);
        watchlistRepository.save(watchlist);
    }

    @Override
    public WatchlistResponse getWatchlist(Long userId) {

        WatchlistEntity watchlist = watchlistRepository.findByUserUserId(userId)
                .orElseThrow(() -> new RuntimeException("Watchlist not found"));

        return mapToResponse(watchlist);
    }

    @Override
    public WatchlistResponse addMovie(Long userId, Long movieId) {

        WatchlistEntity watchlist = watchlistRepository.findByUserUserId(userId)
                .orElseThrow(() -> new RuntimeException("Watchlist not found"));

        MovieEntity movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Movie not found"));

        // check if movie is already in watchlist
        boolean alreadyAdded = watchlist.getMovies().stream()
                .anyMatch(m -> m.getMovieId().equals(movieId));

        if (alreadyAdded) {
            throw new RuntimeException("Movie is already in your watchlist");
        }

        watchlist.getMovies().add(movie);
        watchlistRepository.save(watchlist);

        return mapToResponse(watchlist);
    }

    @Override
    public WatchlistResponse removeMovie(Long userId, Long movieId) {

        WatchlistEntity watchlist = watchlistRepository.findByUserUserId(userId)
                .orElseThrow(() -> new RuntimeException("Watchlist not found"));

        MovieEntity movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Movie not found"));

        // check if movie is actually in the watchlist
        boolean exists = watchlist.getMovies().stream()
                .anyMatch(m -> m.getMovieId().equals(movieId));

        if (!exists) {
            throw new RuntimeException("Movie is not in your watchlist");
        }

        watchlist.getMovies().remove(movie);
        watchlistRepository.save(watchlist);

        return mapToResponse(watchlist);
    }

    private WatchlistResponse mapToResponse(WatchlistEntity watchlist) {

        WatchlistResponse response = new WatchlistResponse();

        response.setWatchlistId(watchlist.getWatchlistId());
        response.setTotalMovies(watchlist.getMovies().size());

        response.setMovies(
                watchlist.getMovies().stream()
                        .map(movie -> {
                            MovieResponse movieResponse = new MovieResponse();
                            movieResponse.setMovieId(movie.getMovieId());
                            movieResponse.setTitle(movie.getTitle());
                            movieResponse.setPosterUrl(movie.getPosterUrl());
                            movieResponse.setTrailerUrl(movie.getTrailerUrl());
                            movieResponse.setReleaseYear(movie.getReleaseYear());
                            movieResponse.setLanguage(movie.getLanguage());
                            movieResponse.setCategories(
                                    movie.getCategories().stream()
                                            .map(CategoryEntity::getName)
                                            .collect(Collectors.toList())
                            );
                            return movieResponse;
                        })
                        .collect(Collectors.toList())
        );
        return response;
    }
}
