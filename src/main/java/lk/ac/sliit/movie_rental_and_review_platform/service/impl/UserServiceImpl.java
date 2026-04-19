package lk.ac.sliit.movie_rental_and_review_platform.service.impl;

import lk.ac.sliit.movie_rental_and_review_platform.dto.request.SignInRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.request.SignUpRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.response.AuthResponse;
import lk.ac.sliit.movie_rental_and_review_platform.entity.UserEntity;
import lk.ac.sliit.movie_rental_and_review_platform.enums.Role;
import lk.ac.sliit.movie_rental_and_review_platform.repository.UserRepository;
import lk.ac.sliit.movie_rental_and_review_platform.security.JwtUtil;
import lk.ac.sliit.movie_rental_and_review_platform.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userDao;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthResponse signup(SignUpRequest request) {
        if (userDao.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        UserEntity user = new UserEntity();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // hash the password
        user.setRole(Role.valueOf(request.getRole()));
        user.setCreatedDate(new Date());

        userDao.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getRole().name(), user.getName());
    }

    public AuthResponse signin(SignInRequest request) {
        // This throws an exception automatically if credentials are wrong
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserEntity user = userDao.findByEmail(request.getEmail()).get();
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getRole().name(), user.getName());
    }

}

