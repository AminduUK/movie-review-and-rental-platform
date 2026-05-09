package lk.ac.sliit.movie_rental_and_review_platform.stripe;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class StripeService {

    @Value("${stripe.secret.key}")
    private String secretKey;

    @Value("${stripe.rental.price}")
    private Long rentalPrice; // in cents

    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey; // initialize Stripe with your secret key
    }

    public PaymentIntent createPaymentIntent(String paymentMethodId) throws StripeException {

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(rentalPrice)          // 299 = $2.99
                .setCurrency("usd")
                .setPaymentMethod(paymentMethodId)
                .setConfirm(true)                // confirm payment immediately
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .setAllowRedirects(
                                        PaymentIntentCreateParams.AutomaticPaymentMethods
                                                .AllowRedirects.NEVER)
                                .build()
                )
                .build();

        return PaymentIntent.create(params);
    }
}
