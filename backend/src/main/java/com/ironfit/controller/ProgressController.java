package com.ironfit.controller;
import com.ironfit.api.ApiException;
import com.ironfit.security.AppUser;
import com.ironfit.service.ProgressService;
import com.ironfit.service.RateLimitService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController @RequestMapping("/api/progress") public class ProgressController {
 private final ProgressService progress;private final RateLimitService limit;public ProgressController(ProgressService progress,RateLimitService limit){this.progress=progress;this.limit=limit;}
 @GetMapping public Map<String,Object> list(@AuthenticationPrincipal AppUser user){return progress.list(user);}
 @PostMapping public Map<String,Object> save(@AuthenticationPrincipal AppUser user,@RequestBody Map<String,Object> body){if(!limit.allow("progress:"+user.id(),30,60_000))throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,"Too many progress updates. Try again shortly.");return progress.save(user,body);}
}
