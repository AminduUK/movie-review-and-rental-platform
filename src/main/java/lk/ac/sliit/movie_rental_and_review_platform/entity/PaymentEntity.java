package lk.ac.sliit.movie_rental_and_review_platform.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "payment")
public class PaymentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    @Column(nullable = false)
    private Double amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;

    public enum PaymentMethod {
        CARD, CASH, UPI
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    public enum PaymentStatus {
        SUCCESS, FAILED
    }

    @Column(nullable = false)
    private LocalDateTime paymentDate;

    // One-to-One → RENTAL (owns the FK)
//    @OneToOne
//    @JoinColumn(name = "rental_id", nullable = false, unique = true)
//    private RentalEntity rental;

}
