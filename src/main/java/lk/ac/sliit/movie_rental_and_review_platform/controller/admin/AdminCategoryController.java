package lk.ac.sliit.movie_rental_and_review_platform.controller.admin;

import lk.ac.sliit.movie_rental_and_review_platform.dto.request.category.CreateCategoryRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.request.category.UpdateCategoryRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.response.category.CategoryResponse;
import lk.ac.sliit.movie_rental_and_review_platform.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/category")
public class AdminCategoryController {

    private final CategoryService categoryService;

    // Add new category
    @PostMapping("/add-category")
    public ResponseEntity<CategoryResponse> addNewCategory(@RequestBody CreateCategoryRequest createRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.addCategory(createRequest));
    }

    // Update existing category
    @PutMapping("/update-category")
    public ResponseEntity<CategoryResponse> updateCategory(@RequestBody UpdateCategoryRequest updateRequest) {
        return ResponseEntity.ok(categoryService.updateCategory(updateRequest));
    }

    // Delete a category
    @DeleteMapping("/delete-category/{categoryId}")
    public ResponseEntity<String> deleteCategory(@PathVariable Long categoryId) {
        categoryService.deleteCategory(categoryId);
        return ResponseEntity.ok("Category deleted successfully");
    }

    // Get all categories
    @GetMapping("/get-all-categories")
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }
}