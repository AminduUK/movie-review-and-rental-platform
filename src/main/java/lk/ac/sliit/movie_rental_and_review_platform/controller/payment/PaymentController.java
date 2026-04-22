package lk.ac.sliit.movie_rental_and_review_platform.controller.payment;

import lk.ac.sliit.movie_rental_and_review_platform.dto.request.PaymentRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.response.PaymentResponse;
import lk.ac.sliit.movie_rental_and_review_platform.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentResponse> makePayment(
            @RequestBody PaymentRequest request) {

        return ResponseEntity.ok(paymentService.processPayment(request));
    }
}
