package lk.ac.sliit.movie_rental_and_review_platform.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secretKey;

    private final long EXPIRATION = 1000 * 60 * 60 * 24;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    public String generateToken(String email, String role) {
        return Jwts.builder()
                .subject(email)                    // ← was setSubject()
                .claim("role", role)
                .issuedAt(new Date())              // ← was setIssuedAt()
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION)) // ← was setExpiration()
                .signWith(getSigningKey())
                .compact();
    }

    public String extractEmail(String token) {
        return Jwts.parser()                       // ← was parserBuilder()
                .verifyWith(getSigningKey())        // ← was setSigningKey()
                .build()
                .parseSignedClaims(token)          // ← was parseClaimsJws()
                .getPayload()                      // ← was getBody()
                .getSubject();
    }

    public boolean isTokenValid(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}

