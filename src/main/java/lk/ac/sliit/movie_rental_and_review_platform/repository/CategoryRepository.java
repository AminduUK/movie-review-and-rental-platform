package lk.ac.sliit.movie_rental_and_review_platform.repository;

import lk.ac.sliit.movie_rental_and_review_platform.entity.CategoryEntity;

import java.util.List;

public interface CategoryRepository {

    List<CategoryEntity> findAllById(List<Long> categoryIds);

}
