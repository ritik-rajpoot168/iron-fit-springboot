package com.ironfit.controller;

import com.ironfit.api.ApiException;
import com.ironfit.security.AppUser;
import com.ironfit.service.AuthService;
import com.ironfit.service.RateLimitService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;

@RestController @RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth; private final String bridgeSecret; private final RateLimitService limits;
    public AuthController(AuthService auth,@Value("${app.bridge.secret}") String bridgeSecret,RateLimitService limits){this.auth=auth;this.bridgeSecret=bridgeSecret;this.limits=limits;}
    @PostMapping("/register") public Map<String,Object> register(@RequestBody Map<String,Object> body,HttpServletRequest req){if(!limits.allow("register:"+req.getRemoteAddr(),5,60_000))throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,"Too many signup attempts. Try again shortly.");return auth.register(body);}
    @PostMapping("/login") public Map<String,Object> login(@RequestBody Map<String,Object> body){return auth.login(body);}
    @PostMapping("/oauth") public Map<String,Object> oauth(@RequestBody Map<String,Object> body,@RequestHeader(value="X-Ironfit-Bridge",required=false) String bridge){
        if(bridgeSecret.isBlank()||bridge==null||!MessageDigest.isEqual(bridgeSecret.getBytes(StandardCharsets.UTF_8),bridge.getBytes(StandardCharsets.UTF_8)))throw new ApiException(HttpStatus.FORBIDDEN,"OAuth bridge is not authorized");
        return auth.oauth(body);
    }
    @GetMapping("/me") public Map<String,Object> me(@AuthenticationPrincipal AppUser user){return auth.me(user);}
}
