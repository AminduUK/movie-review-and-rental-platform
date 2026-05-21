package lk.ac.sliit.movie_rental_and_review_platform.service;

import lk.ac.sliit.movie_rental_and_review_platform.dto.response.watchlist.WatchlistResponse;
import lk.ac.sliit.movie_rental_and_review_platform.entity.UserEntity;

public interface WatchlistService {

    void createWatchlist(UserEntity user);        // called internally on signup

    WatchlistResponse getWatchlist(Long userId);

    WatchlistResponse addMovie(Long userId, Long movieId);

    WatchlistResponse removeMovie(Long userId, Long movieId);

}
