package lk.ac.sliit.movie_rental_and_review_platform.service.impl;

import lk.ac.sliit.movie_rental_and_review_platform.dto.request.auth.SignInRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.request.auth.SignUpRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.request.user.UpdateUserPasswordRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.response.auth.AuthResponse;
import lk.ac.sliit.movie_rental_and_review_platform.dto.response.user.UserResponse;
import lk.ac.sliit.movie_rental_and_review_platform.entity.UserEntity;
import lk.ac.sliit.movie_rental_and_review_platform.enums.Role;
import lk.ac.sliit.movie_rental_and_review_platform.repository.UserRepository;
import lk.ac.sliit.movie_rental_and_review_platform.security.JwtUtil;
import lk.ac.sliit.movie_rental_and_review_platform.service.UserService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    @Override
    public AuthResponse signup(SignUpRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        UserEntity user = new UserEntity();
        user.setUserName(request.getUserName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // hash the password
        user.setRole(Role.valueOf(request.getRole()));
        user.setCreatedDate(new Date());

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getRole().name(), user.getUserName());
    }

    @Override
    public AuthResponse signin(SignInRequest request) {
        // This throws an exception automatically if credentials are wrong
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserEntity user = userRepository.findByEmail(request.getEmail()).get();
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getRole().name(), user.getUserName());
    }

    @Override
    public List<UserResponse> getAllUsers() {
        List<UserResponse> userResponseList = new ArrayList<>();

        userRepository.findAll().forEach(userEntity -> {
            if (userEntity.getRole() == Role.ROLE_USER) {
                UserResponse userResponse = new UserResponse();
                userResponse.setUserID(userEntity.getUserID());
                userResponse.setUserName(userEntity.getUserName());
                userResponse.setEmail(userEntity.getEmail());
                userResponse.setCreatedDate(userEntity.getCreatedDate());
                userResponseList.add(userResponse);
            }
        });
        return userResponseList;
    }

    @Override
    public UserResponse getUserByEmail(String email) {
        UserEntity userEntity = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found or is not a regular user"));
        UserResponse userResponse = new UserResponse();
        userResponse.setUserID(userEntity.getUserID());
        userResponse.setUserName(userEntity.getUserName());
        userResponse.setEmail(userEntity.getEmail());
        userResponse.setCreatedDate(userEntity.getCreatedDate());
        return userResponse;
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public void updateUserPassword(UpdateUserPasswordRequest request) {
        UserEntity userEntity = userRepository.findById(request.getUserID())
                .orElseThrow(() -> new RuntimeException("User not found"));

        //verify current password matches the password in the database
        if (!passwordEncoder.matches(request.getCurrentPassword(), userEntity.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        //make sure new password is different from the current password
        if (passwordEncoder.matches(request.getNewPassword(), userEntity.getPassword())) {
            throw new RuntimeException("New password cannot be the same as current password");
        }

        //encode and save the new password
        userEntity.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(userEntity);

    }

}

