package lk.ac.sliit.movie_rental_and_review_platform.repository;

import lk.ac.sliit.movie_rental_and_review_platform.entity.MovieEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<MovieEntity, Long> {

    boolean existsByTitleIgnoreCase(String title);

    List<MovieEntity> findByTitleContainingIgnoreCase(String title);

    List<MovieEntity> findByCategoriesCategoryId(Long categoryId);

    List<MovieEntity> findByReleaseYear(Integer releaseYear);

}