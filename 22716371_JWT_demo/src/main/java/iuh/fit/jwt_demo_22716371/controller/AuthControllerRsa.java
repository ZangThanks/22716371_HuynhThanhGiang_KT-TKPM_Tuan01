package iuh.fit.jwt_demo_22716371.controller;

import iuh.fit.jwt_demo_22716371.service.JwtRsaTokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/rsa")
public class AuthControllerRsa {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtRsaTokenService jwtRsaTokenService;

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> loginRequest) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password));

        String token = jwtRsaTokenService.generateToken(authentication);
        
        return Map.of(
                "token", token,
                "type", "Bearer",
                "algorithm", "RS256",
                "message", "JWT token generated with RSA256 algorithm"
        );
    }

    @GetMapping("/test")
    public Map<String, String> test(Authentication authentication) {
        return Map.of(
                "message", "Resource Server with RSA is working!",
                "user", authentication.getName(),
                "authorities", authentication.getAuthorities().toString()
        );
    }
}
