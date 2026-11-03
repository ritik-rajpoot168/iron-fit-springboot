package com.ironfit.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {
    private final SecretKey key;
    private final long ttl;
    public JwtService(@Value("${app.jwt.secret}") String secret, @Value("${app.jwt.expiration-ms}") long ttl) {
        if (secret.getBytes(StandardCharsets.UTF_8).length < 32) throw new IllegalArgumentException("JWT_SECRET must be at least 32 bytes");
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)); this.ttl = ttl;
    }
    public String issue(String id, String email, String role) {
        long now = System.currentTimeMillis();
        return Jwts.builder().subject(id).claim("email", email).claim("role", role).issuedAt(new Date(now)).expiration(new Date(now + ttl)).signWith(key).compact();
    }
    public AppUser parse(String token) {
        Claims c = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
        return new AppUser(c.getSubject(), c.get("email", String.class), c.get("role", String.class));
    }
}
