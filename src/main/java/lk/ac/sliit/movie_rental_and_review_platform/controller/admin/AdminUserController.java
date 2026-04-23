package lk.ac.sliit.movie_rental_and_review_platform.controller.admin;

import lk.ac.sliit.movie_rental_and_review_platform.dto.response.UserResponse;
import lk.ac.sliit.movie_rental_and_review_platform.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminUserController {

    private final UserService userService;

    @GetMapping("/get-all-users")
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/search-user/{email}")
    public ResponseEntity<UserResponse> searchUser(@PathVariable String email) {
        return ResponseEntity.ok(userService.getUser(email));
    }


}
