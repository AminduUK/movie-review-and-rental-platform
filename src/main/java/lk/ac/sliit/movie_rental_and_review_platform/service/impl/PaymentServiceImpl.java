package lk.ac.sliit.movie_rental_and_review_platform.service.impl;

import lk.ac.sliit.movie_rental_and_review_platform.dto.request.PaymentRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.response.PaymentResponse;
import lk.ac.sliit.movie_rental_and_review_platform.entity.PaymentEntity;
import lk.ac.sliit.movie_rental_and_review_platform.entity.RentalEntity;
import lk.ac.sliit.movie_rental_and_review_platform.enums.PaymentMethod;
import lk.ac.sliit.movie_rental_and_review_platform.enums.PaymentStatus;
import lk.ac.sliit.movie_rental_and_review_platform.repository.PaymentRepository;
import lk.ac.sliit.movie_rental_and_review_platform.repository.RentalRepository;
import lk.ac.sliit.movie_rental_and_review_platform.repository.UserRepository;
import lk.ac.sliit.movie_rental_and_review_platform.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final RentalRepository rentalRepository;
    private final UserRepository userRepository;

    @Override
    public PaymentResponse processPayment(PaymentRequest request) {
        RentalEntity rental = rentalRepository.findById(request.getRentalId())
                .orElseThrow(() -> new RuntimeException("Rental not found"));

        // prevent duplicate payment
        if (paymentRepository.findByRental_RentalId(rental.getRentalId()).isPresent()) {
            throw new RuntimeException("Payment already exists for this rental");
        }

        PaymentEntity payment = new PaymentEntity();

        payment.setRental(rental);
        payment.setUser(rental.getUser());
        payment.setAmount(calculateAmount(rental)); // your logic
        payment.setPaymentMethod(PaymentMethod.valueOf(request.getPaymentMethod()));
        payment.setPaymentDate(LocalDateTime.now());

        // simulate payment success
        payment.setStatus(PaymentStatus.SUCCESS);

        paymentRepository.save(payment);

        return mapToResponse(payment);
    }

    private PaymentResponse mapToResponse(PaymentEntity payment) {
        PaymentResponse res = new PaymentResponse();
        res.setPaymentId(payment.getPaymentId());
        res.setAmount(payment.getAmount());
        res.setStatus(payment.getStatus().name());
        res.setPaymentMethod(payment.getPaymentMethod().name());
        return res;
    }

    private Double calculateAmount(RentalEntity rental) {
        // simple example (you can improve later)
        return 500.0;
    }

}
