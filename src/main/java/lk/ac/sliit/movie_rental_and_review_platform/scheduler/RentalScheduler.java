package lk.ac.sliit.movie_rental_and_review_platform.scheduler;

import lk.ac.sliit.movie_rental_and_review_platform.entity.RentalEntity;
import lk.ac.sliit.movie_rental_and_review_platform.repository.RentalRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class RentalScheduler {

    private final RentalRepository rentalRepository;

    public RentalScheduler(RentalRepository rentalRepository) {
        this.rentalRepository = rentalRepository;
    }

    @Scheduled(cron = "0 0 0 * * *") // runs every day at midnight
    public void autoReturnOverdueRentals() {

        List<RentalEntity> overdueRentals = rentalRepository
                .findByStatusAndDueDateBefore(
                        RentalEntity.RentalStatus.ACTIVE,
                        LocalDateTime.now()
                );

        overdueRentals.forEach(rental -> {
            rental.setStatus(RentalEntity.RentalStatus.RETURNED);
            rental.setReturnDate(LocalDateTime.now());
        });

        rentalRepository.saveAll(overdueRentals);
    }
}