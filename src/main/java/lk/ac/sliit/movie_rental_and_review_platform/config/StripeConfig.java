package lk.ac.sliit.movie_rental_and_review_platform.config;

import com.stripe.Stripe;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;

@Configuration
public class StripeConfig {

    @Value("${stripe.secret.key}")
    private String secretKey;

    @PostConstruct
    public void init() {
        // This is CRITICAL. Without this, Stripe Java SDK throws "Invalid API Key"
        Stripe.apiKey = secretKey;
    }
}
