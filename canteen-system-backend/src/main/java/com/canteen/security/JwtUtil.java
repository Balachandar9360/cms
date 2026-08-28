package com.canteen.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class JwtUtil {
    @Value("${jwt.secret}")
    private String secret;
    @Value("${jwt.expiration}")
    private long expiration;

    @Value("${canteen.qr.expiration-ms:90000}")
    private long qrExpiration; // 90s default

    private SecretKey key() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(Authentication authentication) {
        String authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expiration);
        return Jwts.builder()
                .setSubject(authentication.getName())
                .claim("roles", authorities)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUsernameFromToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Short-lived, single-purpose token for QR checkout. Subject is the
     * student's studentId (not username), and a "purpose" claim keeps it
     * from ever being mistaken for a login token even though it shares
     * the same signing key.
     */
    public String generateQrCheckoutToken(String studentId) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + qrExpiration);
        return Jwts.builder()
                .setSubject(studentId)
                .setId(UUID.randomUUID().toString())
                .claim("purpose", "QR_CHECKOUT")
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Validates a QR token's signature, expiry, and purpose claim.
     * Returns the parsed claims so the caller can check jti (for
     * single-use enforcement) and extract the studentId.
     */
    public Jws<Claims> parseQrCheckoutToken(String token) {
        Jws<Claims> jws = Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(token);
        if (!"QR_CHECKOUT".equals(jws.getBody().get("purpose"))) {
            throw new JwtException("Not a QR checkout token");
        }
        return jws;
    }
}