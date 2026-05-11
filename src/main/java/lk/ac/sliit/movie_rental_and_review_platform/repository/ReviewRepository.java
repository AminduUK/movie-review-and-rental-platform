package lk.ac.sliit.movie_rental_and_review_platform.repository;

import lk.ac.sliit.movie_rental_and_review_platform.entity.ReviewEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<ReviewEntity, Long> {

    boolean existsByUserUserIdAndMovieMovieId(Long userId, Long movieId);

    List<ReviewEntity> findByMovieMovieId(Long movieId);

}
