package lk.ac.sliit.movie_rental_and_review_platform.service.impl;

import lk.ac.sliit.movie_rental_and_review_platform.dto.request.category.CreateCategoryRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.request.category.UpdateCategoryRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.response.category.CategoryResponse;
import lk.ac.sliit.movie_rental_and_review_platform.entity.CategoryEntity;
import lk.ac.sliit.movie_rental_and_review_platform.repository.CategoryRepository;
import lk.ac.sliit.movie_rental_and_review_platform.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public CategoryResponse addCategory(CreateCategoryRequest createRequest) {

        // Check if the category name already exists
        if (categoryRepository.existsByNameIgnoreCase(createRequest.getName())) {
            throw new RuntimeException("Category already exists");
        }

        CategoryEntity categoryEntity = new CategoryEntity();

        categoryEntity.setName(createRequest.getName());
        categoryEntity.setDescription(createRequest.getDescription());

        // Save and return
        categoryRepository.save(categoryEntity);

        CategoryResponse createResponse = new CategoryResponse();

        createResponse.setCategoryId(categoryEntity.getCategoryId());
        createResponse.setName(categoryEntity.getName());
        createResponse.setDescription(categoryEntity.getDescription());

        return createResponse;
    }

    @Override
    public CategoryResponse updateCategory(UpdateCategoryRequest updateRequest) {

        CategoryEntity categoryEntity = categoryRepository.findById(updateRequest.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Check if the new name is null/empty or doesn't already exist
        if (updateRequest.getName() != null && !updateRequest.getName().isEmpty()) {
            if (!updateRequest.getName().equalsIgnoreCase(categoryEntity.getName()) && categoryRepository.existsByNameIgnoreCase(updateRequest.getName())) {
                throw new RuntimeException("Category with this name already exists");
            }
            categoryEntity.setName(updateRequest.getName());
        }

        if (updateRequest.getDescription() != null && !updateRequest.getDescription().isEmpty()) {
            categoryEntity.setDescription(updateRequest.getDescription());
        }

        // Save and return
        categoryRepository.save(categoryEntity);

        CategoryResponse updateResponse = new CategoryResponse();

        updateResponse.setCategoryId(categoryEntity.getCategoryId());
        updateResponse.setName(categoryEntity.getName());
        updateResponse.setDescription(categoryEntity.getDescription());

        return updateResponse;
    }

    @Override
    public void deleteCategory(Long categoryId) {

        CategoryEntity categoryEntity = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // prevent deleting if category is assigned to movies
        if (!categoryEntity.getMovies().isEmpty()) {
            throw new RuntimeException("Cannot delete category — it is assigned to "
                    + categoryEntity.getMovies().size() + " movie(s)");
        }

        categoryRepository.delete(categoryEntity);
    }

    @Override
    public List<CategoryResponse> getAllCategories() {

        List<CategoryResponse> categoryResponseList = new ArrayList<>();

        categoryRepository.findAll().forEach(categoryEntity -> {
            CategoryResponse categoryResponse = new CategoryResponse();
            categoryResponse.setCategoryId(categoryEntity.getCategoryId());
            categoryResponse.setName(categoryEntity.getName());
            categoryResponse.setDescription(categoryEntity.getDescription());
            categoryResponseList.add(categoryResponse);
        });

        return categoryResponseList;

    }
}