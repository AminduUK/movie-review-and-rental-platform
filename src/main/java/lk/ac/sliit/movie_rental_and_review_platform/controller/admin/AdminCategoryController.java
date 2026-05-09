package lk.ac.sliit.movie_rental_and_review_platform.controller.admin;

import lk.ac.sliit.movie_rental_and_review_platform.dto.request.category.CreateCategoryRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.request.category.UpdateCategoryRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.response.category.CategoryResponse;
import lk.ac.sliit.movie_rental_and_review_platform.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/category")
public class AdminCategoryController {

    private final CategoryService categoryService;

    @PostMapping("/add-category")
    public ResponseEntity<CategoryResponse> addNewCategory(@RequestBody CreateCategoryRequest createRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.addCategory(createRequest));
    }

    @PutMapping("/update-category")
    public ResponseEntity<CategoryResponse> updateCategory(@RequestBody UpdateCategoryRequest updateRequest) {
        return ResponseEntity.ok(categoryService.updateCategory(updateRequest));
    }
}