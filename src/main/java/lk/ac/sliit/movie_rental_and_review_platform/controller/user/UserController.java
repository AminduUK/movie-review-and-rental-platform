package lk.ac.sliit.movie_rental_and_review_platform.controller.user;

import lk.ac.sliit.movie_rental_and_review_platform.dto.request.user.UpdateUserPasswordRequest;
import lk.ac.sliit.movie_rental_and_review_platform.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    @PostMapping("/update-password")
    public ResponseEntity<String> updatePassword(@RequestBody UpdateUserPasswordRequest request) {
        userService.updateUserPassword(request);
        return ResponseEntity.ok("Password updated successfully");
    }

}
