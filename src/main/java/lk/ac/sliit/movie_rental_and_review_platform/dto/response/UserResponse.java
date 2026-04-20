package lk.ac.sliit.movie_rental_and_review_platform.dto.response;

import lk.ac.sliit.movie_rental_and_review_platform.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long userID;
    private String name;
    private String email;
    private Date createdDate;
}
