package lk.ac.sliit.movie_rental_and_review_platform.controller.admin;

import lk.ac.sliit.movie_rental_and_review_platform.dto.response.user.UserResponse;
import lk.ac.sliit.movie_rental_and_review_platform.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/user")
public class AdminUserController {

    private final UserService userService;

    @GetMapping("/get-all-users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/search-user")
    public ResponseEntity<UserResponse> searchUser(@RequestParam String email) {
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    @DeleteMapping("/delete-user/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok("User deleted successfully");
    }

}
