package com.ironfit.controller;
import com.ironfit.service.AuthService;
import com.ironfit.service.PlanService;
import com.ironfit.service.ProgressService;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController @RequestMapping("/api/admin") public class AdminController {
 private final JdbcTemplate db;private final AuthService auth;private final PlanService plans;private final ProgressService progress;
 public AdminController(JdbcTemplate db,AuthService auth,PlanService plans,ProgressService progress){this.db=db;this.auth=auth;this.plans=plans;this.progress=progress;}
 @GetMapping("/stats") public Map<String,Object> stats(){long users=count("users"),totalPlans=plans.count(),records=progress.count();Map<String,Object> stats=new LinkedHashMap<>();stats.put("totalUsers",users);stats.put("totalWorkoutPlans",totalPlans);stats.put("totalProgressRecords",records);stats.put("averagePlansPerUser",users==0?0.0:Math.round((double)totalPlans/users*100.0)/100.0);return Map.of("stats",stats,"recentUsers",auth.recentUsers(),"recentPlans",plans.allRecent());}
 private long count(String table){Long n=db.queryForObject("SELECT COUNT(*) FROM "+table,Long.class);return n==null?0:n;}
}
