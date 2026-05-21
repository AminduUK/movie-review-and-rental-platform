package lk.ac.sliit.movie_rental_and_review_platform.repository;

import lk.ac.sliit.movie_rental_and_review_platform.entity.WatchlistEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface WatchlistRepository extends JpaRepository<WatchlistEntity, Long> {

    Optional<WatchlistEntity> findByUserUserId(Long userId);

}
