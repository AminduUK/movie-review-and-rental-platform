package lk.ac.sliit.movie_rental_and_review_platform.repository;

import lk.ac.sliit.movie_rental_and_review_platform.entity.MovieEntity;
import lk.ac.sliit.movie_rental_and_review_platform.entity.RentalEntity;
import lk.ac.sliit.movie_rental_and_review_platform.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RentalRepository extends JpaRepository<RentalEntity, Long> {

    long countByUserAndStatus(UserEntity user, RentalEntity.RentalStatus status);

    boolean existsByUserAndMovieAndStatus(UserEntity user, MovieEntity movie, RentalEntity.RentalStatus status);

    List<RentalEntity> findByUserAndStatus(UserEntity user, RentalEntity.RentalStatus status);

    List<RentalEntity> findByStatusAndDueDateBefore(RentalEntity.RentalStatus status, LocalDateTime dateTime);

}
