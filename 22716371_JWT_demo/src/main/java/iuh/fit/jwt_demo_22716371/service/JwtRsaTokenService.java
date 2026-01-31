package iuh.fit.jwt_demo_22716371.service;

import iuh.fit.jwt_demo_22716371.config.JwtRsaProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.stream.Collectors;

@Service
public class JwtRsaTokenService {

    @Autowired
    private JwtEncoder jwtEncoder;
    public String generateToken(Authentication authentication) {
        Instant now = Instant.now();

        String roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(" "));

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("self")  // Token issuer
                .issuedAt(now)
                .expiresAt(now.plus(24, ChronoUnit.HOURS))  // Hết hạn sau 24h
                .subject(authentication.getName())
                .claim("roles", roles)
                .build();

        return this.jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }
}
