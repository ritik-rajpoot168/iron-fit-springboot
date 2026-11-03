package com.ironfit.controller;
import com.ironfit.security.AppUser;
import com.ironfit.service.AuthService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController @RequestMapping("/api/user") public class UserController {
 private final AuthService auth; public UserController(AuthService auth){this.auth=auth;}
 @GetMapping public Map<String,Object> get(@AuthenticationPrincipal AppUser user){return auth.getUser(user);}
 @PatchMapping public Map<String,Object> update(@AuthenticationPrincipal AppUser user,@RequestBody Map<String,Object> body){return auth.updateUser(user,body);}
}
