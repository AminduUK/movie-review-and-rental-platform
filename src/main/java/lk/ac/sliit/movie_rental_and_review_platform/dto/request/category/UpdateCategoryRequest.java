package lk.ac.sliit.movie_rental_and_review_platform.dto.request.category;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCategoryRequest {
    private Long categoryId;
    private String name;
    private String description;
}
