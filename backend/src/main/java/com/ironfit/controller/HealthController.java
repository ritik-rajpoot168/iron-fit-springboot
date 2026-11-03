package com.ironfit.controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;
@RestController public class HealthController {
 @GetMapping("/") public Map<String,Object> root(){return Map.of("name","IRON.FIT API","status","ok","message","Backend API is running. Most endpoints require authentication.","routes",new String[]{"/api/auth/register","/api/auth/login","/api/generate","/api/plans","/api/progress","/api/user","/api/admin/stats"});}
 @GetMapping("/api/health") public Map<String,String> health(){return Map.of("status","ok");}
}
