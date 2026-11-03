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
public class ProgressService {
    private final JdbcTemplate db;private final ObjectMapper json;private final FitnessService fitness;
    private static final DateTimeFormatter CREATED=DateTimeFormatter.ofPattern("MMM d, yyyy",Locale.US);
    public ProgressService(JdbcTemplate db,ObjectMapper json,FitnessService fitness){this.db=db;this.json=json;this.fitness=fitness;}
    public Map<String,Object> list(AppUser user){List<Map<String,Object>> records=db.query("SELECT * FROM progress_records WHERE user_id=? ORDER BY date_value DESC,created_at DESC LIMIT 100",(r,n)->row(r.getString("id"),r.getString("date_value"),r.getString("weight"),r.getDouble("bmi"),r.getString("measurements"),r.getInt("completed_workouts"),r.getString("notes"),r.getTimestamp("created_at")),user.id());return Map.of("records",records);}
    public Map<String,Object> save(AppUser user,Map<String,Object> b){String date=String.valueOf(b.getOrDefault("date","")),weight=String.valueOf(b.getOrDefault("weight",""));double w=number(weight,40,160);if(date.isBlank()||date.length()>30)throw bad();
        int completed;try{completed=Integer.parseInt(String.valueOf(b.getOrDefault("completedWorkouts",0)));}catch(Exception e){throw bad();}if(completed<0||completed>14)throw bad();String notes=String.valueOf(b.getOrDefault("notes",""));if(notes.length()>1000)throw bad();
        Map<String,Object> measurements=measurements(b.get("measurements"));Map<String,Object> profile=db.query("SELECT fitness_profile FROM users WHERE id=?",(r,n)->readMap(r.getString("fitness_profile")),user.id()).stream().findFirst().orElse(Map.of());Object height=profile.getOrDefault("height","175");double bmi=fitness.bmi(w,height);
        String id=UUID.randomUUID().toString();db.update("INSERT INTO progress_records(id,user_id,date_value,weight,bmi,measurements,completed_workouts,notes) VALUES(?,?,?,?,?,CAST(? AS JSON),?,?)",id,user.id(),date,weight,bmi,write(measurements),completed,notes);
        return Map.of("record",record(id,date,weight,bmi,measurements,completed,notes,""));}
    public long count(){Long n=db.queryForObject("SELECT COUNT(*) FROM progress_records",Long.class);return n==null?0:n;}
    private Map<String,Object> row(String id,String date,String weight,double bmi,String measures,int workouts,String notes,java.sql.Timestamp created){Map<String,Object> r=record(id,date,weight,bmi,readMap(measures),workouts,notes,created.toLocalDateTime().format(CREATED));return r;}
    private Map<String,Object> record(String id,String date,String weight,double bmi,Object measures,int workouts,String notes,String created){Map<String,Object> m=new LinkedHashMap<>();m.put("id",id);m.put("date",date);m.put("weight",weight);m.put("bmi",bmi);m.put("measurements",measures);m.put("completedWorkouts",workouts);m.put("notes",notes);if(!created.isEmpty())m.put("createdAt",created);return m;}
    private Map<String,Object> measurements(Object raw){Map<String,Object> m=raw instanceof Map<?,?> x?cast(x):new LinkedHashMap<>();for(String k:List.of("chest","waist","hips","arms","thighs")){String v=String.valueOf(m.getOrDefault(k,""));if(!v.isBlank()){double min=k.equals("arms")?15:k.equals("thighs")?25:40,max=k.equals("arms")?70:k.equals("thighs")?100:180;number(v,min,max);}m.put(k,v);}return m;}
    private double number(String s,double min,double max){try{double d=Double.parseDouble(s);if(!Double.isFinite(d)||d<min||d>max)throw new NumberFormatException();return d;}catch(Exception e){throw bad();}}
    private Map<String,Object> readMap(String s){try{Object value=json.readValue(s,new TypeReference<Object>(){});if(value instanceof String nested)value=json.readValue(nested,new TypeReference<Object>(){});return value instanceof Map<?,?> m?cast(m):Map.of();}catch(Exception e){return Map.of();}}
    private String write(Object o){try{return json.writeValueAsString(o);}catch(Exception e){throw bad();}}
    private Map<String,Object> cast(Map<?,?> x){Map<String,Object> r=new LinkedHashMap<>();x.forEach((k,v)->r.put(String.valueOf(k),v));return r;}
    private ApiException bad(){return new ApiException(HttpStatus.BAD_REQUEST,"Invalid progress payload");}
}
