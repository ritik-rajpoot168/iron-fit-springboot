package com.ironfit.controller;
import com.ironfit.security.AppUser;
import com.ironfit.service.PlanService;
import com.ironfit.service.RateLimitService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController @RequestMapping("/api") public class PlansController {
 private final PlanService plans;private final RateLimitService limit;public PlansController(PlanService plans,RateLimitService limit){this.plans=plans;this.limit=limit;}
 @PostMapping("/generate") public Map<String,Object> generate(@RequestBody Object body,@AuthenticationPrincipal AppUser user,HttpServletRequest req){allow("generate:"+ip(req)+":"+user.id(),12);return plans.generate(body);}
 @GetMapping("/plans") public Map<String,Object> list(@AuthenticationPrincipal AppUser user){return plans.list(user);}
 @PostMapping("/plans") public Map<String,Object> save(@AuthenticationPrincipal AppUser user,@RequestBody Map<String,Object> body,HttpServletRequest req){allow("save:"+ip(req),30);return plans.save(user,body);}
 @GetMapping("/plans/{id}") public Map<String,Object> get(@AuthenticationPrincipal AppUser user,@PathVariable String id){return plans.get(user,id);}
 @DeleteMapping("/plans/{id}") public Map<String,Object> delete(@AuthenticationPrincipal AppUser user,@PathVariable String id){return plans.delete(user,id);}
 @PatchMapping("/plans/{id}") public Map<String,Object> rename(@AuthenticationPrincipal AppUser user,@PathVariable String id,@RequestBody Map<String,Object> body){return plans.rename(user,id,body);}
 @PutMapping("/plans/{id}") public Map<String,Object> progress(@AuthenticationPrincipal AppUser user,@PathVariable String id,@RequestBody Map<String,Object> body){return plans.progress(user,id,body);}
 private void allow(String k,int max){if(!limit.allow(k,max,60_000))throw new com.ironfit.api.ApiException(org.springframework.http.HttpStatus.TOO_MANY_REQUESTS,"Too many requests. Try again shortly.");}
 private String ip(HttpServletRequest r){String ip=r.getHeader("X-Forwarded-For");return ip==null?r.getRemoteAddr():ip.split(",")[0].trim();}
}
