package lk.ac.sliit.movie_rental_and_review_platform.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "review")
public class ReviewEntity {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long reviewId;

        @Column(columnDefinition = "TEXT")
        private String comment;

        @Column(nullable = false)
        private Integer rating; // 1 - 5

        @CreationTimestamp
        @Column(updatable = false)
        private LocalDateTime reviewDate;

        // Many-to-One → USER
        @ManyToOne
        @JoinColumn(name = "user_id", nullable = false)
        private UserEntity user;

        // Many-to-One → MOVIE
        @ManyToOne
        @JoinColumn(name = "movie_id", nullable = false)
        private MovieEntity movie;

}

