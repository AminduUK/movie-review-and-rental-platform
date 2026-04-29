package lk.ac.sliit.movie_rental_and_review_platform.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignUpRequest {
    private String userName;
    private String email;
    private String password;
    private String role;
}
