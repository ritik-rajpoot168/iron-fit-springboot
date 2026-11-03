package com.ironfit.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ironfit.api.ApiException;
import com.ironfit.security.AppUser;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class PlanService {
    private final JdbcTemplate db; private final ObjectMapper json; private final FitnessService fitness; private final WorkoutPlanGenerator generator;
    private static final DateTimeFormatter CREATED=DateTimeFormatter.ofPattern("MMM d, yyyy",Locale.US);
    public PlanService(JdbcTemplate db,ObjectMapper json,FitnessService fitness,WorkoutPlanGenerator generator){this.db=db;this.json=json;this.fitness=fitness;this.generator=generator;}

    public Map<String,Object> generate(Object raw){Map<String,Object> p=fitness.validateProfile(raw);return Map.of("plan",generator.generate(p,fitness.targets(p)));}
    public Map<String,Object> list(AppUser user){List<Map<String,Object>> plans=db.query("SELECT * FROM workout_plans WHERE user_id=? ORDER BY created_at DESC LIMIT 250",(r,n)->row(r.getString("id"),r.getString("name"),r.getString("goal"),r.getString("level"),r.getString("workout_type"),r.getString("equipment"),r.getString("plan_data"),r.getString("profile_data"),r.getString("progress"),r.getTimestamp("created_at")),user.id());return Map.of("plans",plans);}
    public Map<String,Object> save(AppUser user,Map<String,Object> body){Map<String,Object> profile=fitness.validateProfile(body.get("profile"));Object rawPlan=body.get("plan");if(!(rawPlan instanceof Map<?,?> planMap)||!planMap.containsKey("planName")||!(planMap.get("weeklySchedule") instanceof List<?>))throw new ApiException(HttpStatus.BAD_REQUEST,"Invalid plan payload");
        Map<String,Object> plan=cast(planMap);String name=String.valueOf(plan.get("planName"));if(name.isBlank()||name.length()>100)throw new ApiException(HttpStatus.BAD_REQUEST,"Invalid plan payload");String id=UUID.randomUUID().toString();Map<String,Object> progress=Map.of("completedDays",List.of(),"notes","");
        db.update("INSERT INTO workout_plans(id,user_id,name,goal,level,workout_type,equipment,plan_data,profile_data,progress) VALUES(?,?,?,?,?,?,?,CAST(? AS JSON),CAST(? AS JSON),CAST(? AS JSON))",id,user.id(),name,profile.get("goal"),profile.get("level"),profile.get("workoutType"),profile.get("equipment"),write(plan),write(profile),write(progress));return Map.of("plan",getOwned(user,id));}
    public Map<String,Object> get(AppUser user,String id){return Map.of("plan",getOwned(user,id));}
    public Map<String,Object> delete(AppUser user,String id){if(db.update("DELETE FROM workout_plans WHERE id=? AND user_id=?",id,user.id())==0)throw notFound();return Map.of("success",true);}
    public Map<String,Object> rename(AppUser user,String id,Map<String,Object> body){String name=String.valueOf(body.getOrDefault("name","")).trim();if(name.isBlank()||name.length()>100)throw new ApiException(HttpStatus.BAD_REQUEST,"Name is required");if(db.update("UPDATE workout_plans SET name=? WHERE id=? AND user_id=?",name,id,user.id())==0)throw notFound();return Map.of("plan",getOwned(user,id));}
    public Map<String,Object> progress(AppUser user,String id,Map<String,Object> body){Object days=body.getOrDefault("completedDays",List.of());if(!(days instanceof List<?> list)||list.size()>7||list.stream().anyMatch(d->String.valueOf(d).length()>20))throw new ApiException(HttpStatus.BAD_REQUEST,"Invalid progress payload");String notes=String.valueOf(body.getOrDefault("notes", ""));if(notes.length()>2000)throw new ApiException(HttpStatus.BAD_REQUEST,"Invalid progress payload");Map<String,Object> p=Map.of("completedDays",list,"notes",notes,"lastUpdatedAt",java.time.Instant.now().toString());if(db.update("UPDATE workout_plans SET progress=CAST(? AS JSON) WHERE id=? AND user_id=?",write(p),id,user.id())==0)throw notFound();return Map.of("plan",getOwned(user,id));}
    public List<Map<String,Object>> allRecent(){return db.query("SELECT id,name,goal,level,created_at FROM workout_plans ORDER BY created_at DESC LIMIT 8",(r,n)->Map.of("id",r.getString("id"),"name",r.getString("name"),"goal",r.getString("goal"),"level",r.getString("level"),"createdAt",r.getTimestamp("created_at").toInstant().toString()));}
    public long count(){Long n=db.queryForObject("SELECT COUNT(*) FROM workout_plans",Long.class);return n==null?0:n;}
    private Map<String,Object> getOwned(AppUser u,String id){return db.query("SELECT * FROM workout_plans WHERE id=? AND user_id=?",(r,n)->row(r.getString("id"),r.getString("name"),r.getString("goal"),r.getString("level"),r.getString("workout_type"),r.getString("equipment"),r.getString("plan_data"),r.getString("profile_data"),r.getString("progress"),r.getTimestamp("created_at")),id,u.id()).stream().findFirst().orElseThrow(this::notFound);}
    private Map<String,Object> row(String id,String name,String goal,String level,String type,String equipment,String plan,String profile,String progress,java.sql.Timestamp created){Map<String,Object> m=new LinkedHashMap<>();m.put("id",id);m.put("name",name);m.put("goal",goal);m.put("level",level);m.put("workoutType",type);m.put("equipment",equipment);m.put("planData",read(plan));m.put("profileData",read(profile));m.put("progress",read(progress));m.put("createdAt",created.toLocalDateTime().format(CREATED));return m;}
    private Object read(String s){try{Object value=json.readValue(s,new TypeReference<Object>(){});return value instanceof String nested?json.readValue(nested,new TypeReference<Object>(){}):value;}catch(Exception e){return Map.of();}}
    private String write(Object o){try{return json.writeValueAsString(o);}catch(Exception e){throw new ApiException(HttpStatus.BAD_REQUEST,"Invalid JSON payload");}}
    private Map<String,Object> cast(Map<?,?> m){Map<String,Object> r=new LinkedHashMap<>();m.forEach((k,v)->r.put(String.valueOf(k),v));return r;}
    private ApiException notFound(){return new ApiException(HttpStatus.NOT_FOUND,"Not found");}
}
