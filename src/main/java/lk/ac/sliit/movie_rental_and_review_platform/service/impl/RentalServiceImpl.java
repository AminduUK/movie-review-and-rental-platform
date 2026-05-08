package lk.ac.sliit.movie_rental_and_review_platform.service.impl;

import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import lk.ac.sliit.movie_rental_and_review_platform.dto.request.rental.CreateRentalRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.response.rental.RentalResponse;
import lk.ac.sliit.movie_rental_and_review_platform.entity.MovieEntity;
import lk.ac.sliit.movie_rental_and_review_platform.entity.PaymentEntity;
import lk.ac.sliit.movie_rental_and_review_platform.entity.RentalEntity;
import lk.ac.sliit.movie_rental_and_review_platform.entity.UserEntity;
import lk.ac.sliit.movie_rental_and_review_platform.repository.MovieRepository;
import lk.ac.sliit.movie_rental_and_review_platform.repository.PaymentRepository;
import lk.ac.sliit.movie_rental_and_review_platform.repository.RentalRepository;
import lk.ac.sliit.movie_rental_and_review_platform.repository.UserRepository;
import lk.ac.sliit.movie_rental_and_review_platform.service.RentalService;
import lk.ac.sliit.movie_rental_and_review_platform.stripe.StripeService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RentalServiceImpl implements RentalService {

    private final RentalRepository rentalRepository;
    private final PaymentRepository paymentRepository;
    private final MovieRepository movieRepository;
    private final UserRepository userRepository;
    private final StripeService stripeService;

    @Value("${stripe.rental.price}")
    private Long rentalPrice;

    private static final int MAX_ACTIVE_RENTALS = 3;
    private static final int RENTAL_DURATION_DAYS = 7;

    @Override
    @Transactional
    public RentalResponse rentMovie(Long userId, CreateRentalRequest createRequest) {

        UserEntity userEntity = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        MovieEntity movieEntity = movieRepository.findById(createRequest.getMovieId())
                .orElseThrow(() -> new RuntimeException("Movie not found"));

        // Rule 1: Max 3 active rentals
        long activeRentals = rentalRepository.countByUserAndStatus(userEntity, RentalEntity.RentalStatus.ACTIVE);

        if (activeRentals >= MAX_ACTIVE_RENTALS) {
            throw new RuntimeException("Rental limit reached. Return a movie before renting another.");
        }

        // Rule 2: Can't rent same movie twice
        if (rentalRepository.existsByUserAndMovieAndStatus(userEntity, movieEntity, RentalEntity.RentalStatus.ACTIVE)) {
            throw new RuntimeException("You are already renting this movie.");
        }

        // Step 1: Process payment through Stripe
        PaymentIntent paymentIntent;
        try {
            paymentIntent = stripeService.createPaymentIntent(createRequest.getPaymentMethodId());
        } catch (StripeException e) {
            throw new RuntimeException("Payment failed: " + e.getMessage());
        }

        // Step 2: Create Rental
        RentalEntity rentalEntity = new RentalEntity();

        rentalEntity.setUser(userEntity);
        rentalEntity.setMovie(movieEntity);
        rentalEntity.setRentalDate(LocalDateTime.now());
        rentalEntity.setDueDate(LocalDateTime.now().plusDays(RENTAL_DURATION_DAYS));
        rentalEntity.setStatus(RentalEntity.RentalStatus.ACTIVE);
        rentalRepository.save(rentalEntity);

        // Step 3: Create Payment record
        PaymentEntity payment = new PaymentEntity();

        payment.setRental(rentalEntity);
        payment.setAmount(rentalPrice / 100.0); // convert cents to dollars for storage
        payment.setPaymentDate(LocalDateTime.now());

        // check Stripe's response
        if (paymentIntent.getStatus().equals("succeeded")) {
            payment.setStatus(PaymentEntity.PaymentStatus.SUCCESS);
        } else {
            payment.setStatus(PaymentEntity.PaymentStatus.FAILED);
            // cancel the rental if payment didn't succeed
            rentalEntity.setStatus(RentalEntity.RentalStatus.RETURNED);
            rentalRepository.save(rentalEntity);
        }

        // Save and return
        paymentRepository.save(payment);

        RentalResponse response = new RentalResponse();

        response.setRentalId(rentalEntity.getRentalId());
        response.setMovieTitle(rentalEntity.getMovie().getTitle());
        response.setPosterUrl(rentalEntity.getMovie().getPosterUrl());
        response.setRentalDate(rentalEntity.getRentalDate());
        response.setDueDate(rentalEntity.getDueDate());
        response.setRentalStatus(rentalEntity.getStatus().name());
        response.setPaymentStatus(payment.getStatus().name());
        response.setAmountPaid(payment.getAmount());

        return response;
    }

}
