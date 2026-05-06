package lk.ac.sliit.movie_rental_and_review_platform.service;

import lk.ac.sliit.movie_rental_and_review_platform.dto.request.auth.SignInRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.request.auth.SignUpRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.request.user.UpdateUserPasswordRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.response.auth.AuthResponse;
import lk.ac.sliit.movie_rental_and_review_platform.dto.response.user.UserResponse;
import java.util.List;

public interface UserService {

    AuthResponse signup(SignUpRequest request);

    AuthResponse signin(SignInRequest request);

    List<UserResponse> getAllUsers();

    UserResponse getUserByEmail(String email);

    void deleteUser(Long id);

    void updateUserPassword(UpdateUserPasswordRequest request);

}
