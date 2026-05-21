package lk.ac.sliit.movie_rental_and_review_platform.repository;

import lk.ac.sliit.movie_rental_and_review_platform.entity.PaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentEntity, Long> {

}