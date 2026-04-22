package lk.ac.sliit.movie_rental_and_review_platform.controller.auth;

import lk.ac.sliit.movie_rental_and_review_platform.dto.request.SignInRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.request.SignUpRequest;
import lk.ac.sliit.movie_rental_and_review_platform.dto.response.AuthResponse;
import lk.ac.sliit.movie_rental_and_review_platform.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody SignUpRequest request) {
        return ResponseEntity.ok(userService.signup(request));
    }

    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> signin(@RequestBody SignInRequest request) {
        return ResponseEntity.ok(userService.signin(request));
    }
}
