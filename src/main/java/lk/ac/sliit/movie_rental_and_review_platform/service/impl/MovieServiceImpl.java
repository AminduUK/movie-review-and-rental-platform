package lk.ac.sliit.movie_rental_and_review_platform.service.impl;

import lk.ac.sliit.movie_rental_and_review_platform.dto.request.movie.CreateMovieRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.response.movie.MovieResponse;
import lk.ac.sliit.movie_rental_and_review_platform.entity.CategoryEntity;
import lk.ac.sliit.movie_rental_and_review_platform.entity.MovieEntity;
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
        movieEntity.setCreatedAt(new Date());

        // Step 3 — attach categories if provided
        if (createRequest.getCategoryIds() != null && !createRequest.getCategoryIds().isEmpty()) {
            List<CategoryEntity> categories = categoryRepository.findAllById(createRequest.getCategoryIds());
            if (categories.size() != createRequest.getCategoryIds().size()) {
                throw new RuntimeException("One or more category IDs are invalid");
            }
            movieEntity.setCategories(categories);
        }

        // Step 4 — save and return
        movieRepository.save(movieEntity);

        MovieResponse createResponse = new MovieResponse();

        createResponse.setMovieId(movieEntity.getMovieId());
        createResponse.setTitle(movieEntity.getTitle());
        createResponse.setDescription(movieEntity.getDescription());
        createResponse.setLanguage(movieEntity.getLanguage());
        createResponse.setDuration(movieEntity.getDuration());
        createResponse.setReleaseYear(movieEntity.getReleaseYear());
        createResponse.setPosterUrl(movieEntity.getPosterUrl());
        createResponse.setCreatedAt(movieEntity.getCreatedAt());

        createResponse.setCategories(
                movieEntity.getCategories().stream()
                        .map(CategoryEntity::getName)
                        .collect(Collectors.toList())
        );

        return createResponse;

    }
}