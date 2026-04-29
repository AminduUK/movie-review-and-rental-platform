package lk.ac.sliit.movie_rental_and_review_platform.service;

import lk.ac.sliit.movie_rental_and_review_platform.dto.request.SignInRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.request.SignUpRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.response.AuthResponse;
import lk.ac.sliit.movie_rental_and_review_platform.dto.response.UserResponse;
import java.util.List;

public interface UserService {

    AuthResponse signup(SignUpRequest request);

    AuthResponse signin(SignInRequest request);

    List<UserResponse> getAllUsers();

    UserResponse getUserByEmail(String email);

    void deleteUser(Long id);

}
