package lk.ac.sliit.movie_rental_and_review_platform.service.impl;

import lk.ac.sliit.movie_rental_and_review_platform.dto.request.movie.CreateMovieRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.request.movie.UpdateMovieRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.response.movie.MovieResponse;
import lk.ac.sliit.movie_rental_and_review_platform.entity.CategoryEntity;
import lk.ac.sliit.movie_rental_and_review_platform.entity.MovieEntity;
import lk.ac.sliit.movie_rental_and_review_platform.entity.RentalEntity;
import lk.ac.sliit.movie_rental_and_review_platform.repository.CategoryRepository;
import lk.ac.sliit.movie_rental_and_review_platform.repository.MovieRepository;
import lk.ac.sliit.movie_rental_and_review_platform.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MovieServiceImpl implements MovieService {

    private final MovieRepository movieRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public MovieResponse addMovie(CreateMovieRequest createRequest) {

        // Check if the movie title already exists
        if (movieRepository.existsByTitleIgnoreCase(createRequest.getTitle())) {
            throw new RuntimeException("A movie with this title already exists");
        }

        MovieEntity movieEntity = new MovieEntity();

        movieEntity.setTitle(createRequest.getTitle());
        movieEntity.setDescription(createRequest.getDescription());
        movieEntity.setLanguage(createRequest.getLanguage());
        movieEntity.setDuration(createRequest.getDuration());
        movieEntity.setReleaseYear(createRequest.getReleaseYear());
        movieEntity.setPosterUrl(createRequest.getPosterUrl());
        movieEntity.setTrailerUrl(createRequest.getTrailerUrl());
        movieEntity.setCreatedAt(new Date());

        // Attach categories if provided
        if (createRequest.getCategoryIds() != null && !createRequest.getCategoryIds().isEmpty()) {
            List<CategoryEntity> categories = categoryRepository.findAllById(createRequest.getCategoryIds());
            if (categories.size() != createRequest.getCategoryIds().size()) {
                throw new RuntimeException("One or more category IDs are invalid");
            }
            movieEntity.setCategories(categories);
        }

        // Save and Return
        movieRepository.save(movieEntity);

        return mapToResponse(movieEntity);
    }

    @Override
    public MovieResponse updateMovie(UpdateMovieRequest updateRequest) {

        MovieEntity movieEntity = movieRepository.findById(updateRequest.getMovieId())
                .orElseThrow(() -> new RuntimeException("Movie not found"));

        // Check if the new title is null/empty or doesn't already exist
        if (updateRequest.getTitle() != null && !updateRequest.getTitle().isEmpty()) {
            if (!updateRequest.getTitle().equalsIgnoreCase(movieEntity.getTitle()) && movieRepository.existsByTitleIgnoreCase(updateRequest.getTitle())) {
                throw new RuntimeException("A movie with this title already exists");
            }
            movieEntity.setTitle(updateRequest.getTitle());
        }

        if (updateRequest.getDescription() != null) {
            movieEntity.setDescription(updateRequest.getDescription());
        }

        if (updateRequest.getLanguage() != null) {
            movieEntity.setLanguage(updateRequest.getLanguage());
        }

        if (updateRequest.getDuration() != null) {
            movieEntity.setDuration(updateRequest.getDuration());
        }

        if (updateRequest.getReleaseYear() != null) {
            movieEntity.setReleaseYear(updateRequest.getReleaseYear());
        }

        if (updateRequest.getPosterUrl() != null) {
            movieEntity.setPosterUrl(updateRequest.getPosterUrl());
        }

        if (updateRequest.getTrailerUrl() != null) {
            movieEntity.setTrailerUrl(updateRequest.getTrailerUrl());
        }

        // Update categories if provided
        if (updateRequest.getCategoryIds() != null && !updateRequest.getCategoryIds().isEmpty()) {
            List<CategoryEntity> categories = categoryRepository.findAllById(updateRequest.getCategoryIds());
            if (categories.size() != updateRequest.getCategoryIds().size()) {
                throw new RuntimeException("One or more category IDs are invalid");
            }
            movieEntity.setCategories(categories);
        }

        // Save and return
        movieRepository.save(movieEntity);

        return mapToResponse(movieEntity);
    }

    @Override
    public void deleteMovie(Long movieId) {

        // Check if the movie exists
        MovieEntity movieEntity = movieRepository.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Movie not found"));

        // check if movie has active rentals
        boolean hasActiveRentals = movieEntity.getRentals().stream()
                .anyMatch(rental -> rental.getStatus() == RentalEntity.RentalStatus.ACTIVE);

        if (hasActiveRentals) {
            throw new RuntimeException("Cannot delete movie — it has active rentals");
        }

        movieRepository.delete(movieEntity);
    }

    @Override
    public List<MovieResponse> searchMovieByTitle(String title) {

        List<MovieEntity> movieEntities = movieRepository.findByTitleContainingIgnoreCase(title);

        if (movieEntities.isEmpty()) {
            throw new RuntimeException("No movies found with title: " + title);
        }

        return movieEntities.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

    }

    @Override
    public List<MovieResponse> getMoviesByCategory(Long categoryId) {

        List<MovieEntity> movieEntities = movieRepository.findByCategoriesCategoryId(categoryId);

        if (movieEntities.isEmpty()) {
            throw new RuntimeException("No movies found for this category");
        }

        return movieEntities.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

    }

    @Override
    public List<MovieResponse> getMoviesByYear(Integer releaseYear) {

        List<MovieEntity> movies = movieRepository.findByReleaseYear(releaseYear);

        if (movies.isEmpty()) {
            throw new RuntimeException("No movies found for year: " + releaseYear);
        }

        return movies.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

    }

    @Override
    public List<MovieResponse> getAllMovies() {

        return movieRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

    }

    private MovieResponse mapToResponse(MovieEntity movieEntity) {

        MovieResponse movieResponse = new MovieResponse();

        movieResponse.setMovieId(movieEntity.getMovieId());
        movieResponse.setTitle(movieEntity.getTitle());
        movieResponse.setDescription(movieEntity.getDescription());
        movieResponse.setLanguage(movieEntity.getLanguage());
        movieResponse.setDuration(movieEntity.getDuration());
        movieResponse.setReleaseYear(movieEntity.getReleaseYear());
        movieResponse.setPosterUrl(movieEntity.getPosterUrl());
        movieResponse.setTrailerUrl(movieEntity.getTrailerUrl());
        movieResponse.setCreatedAt(movieEntity.getCreatedAt());

        movieResponse.setCategories(
                movieEntity.getCategories().stream()
                        .map(CategoryEntity::getName)
                        .collect(Collectors.toList())
        );

        return movieResponse;
    }
}