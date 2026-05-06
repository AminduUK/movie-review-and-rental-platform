package lk.ac.sliit.movie_rental_and_review_platform.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "rental")
public class RentalEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long rentalId;

    @Column(nullable = false)
    private LocalDateTime rentalDate;

    @Column(nullable = false)
    private LocalDateTime dueDate;

    private LocalDateTime returnDate; // null = still active

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RentalStatus status;

    public enum RentalStatus {
        ACTIVE, RETURNED
    }

    // Many-to-One → USER
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    // Many-to-One → MOVIE
    @ManyToOne
    @JoinColumn(name = "movie_id", nullable = false)
    private MovieEntity movie;

    // One-to-One → PAYMENT
    @OneToOne(mappedBy = "rental", cascade = CascadeType.ALL)
    private PaymentEntity payment;

}
