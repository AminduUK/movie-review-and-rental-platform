package lk.ac.sliit.movie_rental_and_review_platform.service;

import lk.ac.sliit.movie_rental_and_review_platform.dto.request.category.CreateCategoryRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.request.category.UpdateCategoryRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.response.category.CategoryResponse;
import java.util.List;

public interface CategoryService {

    CategoryResponse addCategory(CreateCategoryRequest createRequest);

    CategoryResponse updateCategory(UpdateCategoryRequest updateRequest);

    void deleteCategory(Long categoryId);

    List<CategoryResponse> getAllCategories();
}
