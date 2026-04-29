package lk.ac.sliit.movie_rental_and_review_platform.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserPasswordRequest {
    private Long userID;
    private String currentPassword;
    private String newPassword;
}
