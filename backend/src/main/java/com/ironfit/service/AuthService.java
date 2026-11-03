package com.ironfit.service;

import com.ironfit.api.ApiException;
import com.ironfit.security.AppUser;
import com.ironfit.security.JwtService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class AuthService {
    private final JdbcTemplate db; private final PasswordEncoder passwords; private final JwtService jwt; private final ObjectMapper json; private final FitnessService fitness;
    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    public AuthService(JdbcTemplate db, PasswordEncoder passwords, JwtService jwt, ObjectMapper json,FitnessService fitness) { this.db=db; this.passwords=passwords; this.jwt=jwt; this.json=json; this.fitness=fitness; }

    public Map<String,Object> register(Map<String,Object> body) {
        String email = String.valueOf(body.getOrDefault("email", "")).trim().toLowerCase(Locale.ROOT), password = String.valueOf(body.getOrDefault("password", ""));
        String name = String.valueOf(body.getOrDefault("name", "")).trim();
        if (!EMAIL.matcher(email).matches() || email.length()>160 || password.length()<8 || password.length()>128 || name.length()>80)
            throw new ApiException(HttpStatus.BAD_REQUEST, "Enter a valid email and a password with at least 8 characters.");
        if (db.queryForObject("SELECT COUNT(*) FROM users WHERE email=?", Integer.class, email)>0) throw new ApiException(HttpStatus.CONFLICT, "Email already registered");
        String id=UUID.randomUUID().toString();
        db.update("INSERT INTO users(id,name,email,password_hash,role) VALUES(?,?,?,?, 'user')",id,name.isBlank()?null:name,email,passwords.encode(password));
        return Map.of("user", publicUser(id,name,email,"user",null));
    }

    public Map<String,Object> login(Map<String,Object> body) {
        String email=String.valueOf(body.getOrDefault("email", "")).trim().toLowerCase(Locale.ROOT), password=String.valueOf(body.getOrDefault("password", ""));
        var rows=db.query("SELECT id,name,email,password_hash,role,image,fitness_profile FROM users WHERE email=?",(r,n)->{
            String hash=r.getString("password_hash"); if(hash==null||!passwords.matches(password,hash)) return null;
            return userRow(r.getString("id"),r.getString("name"),r.getString("email"),r.getString("role"),r.getString("image"),r.getString("fitness_profile"));
        },email).stream().filter(Objects::nonNull).toList();
        if(rows.isEmpty()) throw new ApiException(HttpStatus.UNAUTHORIZED,"Invalid email or password");
        Map<String,Object> u=rows.get(0);
        return Map.of("token",jwt.issue((String)u.get("id"),(String)u.get("email"),(String)u.get("role")),"user",u);
    }

    public Map<String,Object> oauth(Map<String,Object> body) {
        String email=String.valueOf(body.getOrDefault("email", "")).trim().toLowerCase(Locale.ROOT);
        if(!EMAIL.matcher(email).matches()) throw new ApiException(HttpStatus.BAD_REQUEST,"A verified Google email is required");
        String name=String.valueOf(body.getOrDefault("name", "")).trim(); String image=Objects.toString(body.get("image"),null);
        String subject=Objects.toString(body.get("subject"),"");
        List<Map<String,Object>> users=db.query("SELECT id,name,email,role,image,fitness_profile FROM users WHERE email=?",(r,n)->userRow(r.getString("id"),r.getString("name"),r.getString("email"),r.getString("role"),r.getString("image"),r.getString("fitness_profile")),email);
        Map<String,Object> u;
        if(users.isEmpty()) { String id=UUID.randomUUID().toString(); db.update("INSERT INTO users(id,name,email,role,image,google_subject) VALUES(?,?,?,'user',?,?)",id,name.isBlank()?null:name,email,image,subject.isBlank()?null:subject); u=publicUser(id,name,email,"user",image); }
        else { u=users.get(0); if(!subject.isBlank()) db.update("UPDATE users SET google_subject=COALESCE(google_subject,?), image=COALESCE(image,?) WHERE id=?",subject,image,u.get("id")); }
        return Map.of("token",jwt.issue((String)u.get("id"),(String)u.get("email"),(String)u.get("role")),"user",u);
    }

    public Map<String,Object> me(AppUser principal) { return Map.of("user",findUser(principal.id())); }
    public Map<String,Object> getUser(AppUser principal) { return Map.of("user",findUser(principal.id())); }
    public Map<String,Object> updateUser(AppUser principal, Map<String,Object> body) {
        String name=String.valueOf(body.getOrDefault("name", "")).trim();
        if(name.isBlank()||name.length()>80) throw new ApiException(HttpStatus.BAD_REQUEST,"Name is required");
        String profile=body.containsKey("fitnessProfile")?write(fitness.validateProfile(body.get("fitnessProfile"))):null;
        int rows=profile==null?db.update("UPDATE users SET name=? WHERE id=?",name,principal.id()):db.update("UPDATE users SET name=?,fitness_profile=CAST(? AS JSON) WHERE id=?",name,profile,principal.id());
        if(rows==0) throw new ApiException(HttpStatus.NOT_FOUND,"Not found"); return getUser(principal);
    }
    public Map<String,Object> findUser(String id) {
        return db.query("SELECT id,name,email,role,image,fitness_profile FROM users WHERE id=?",(r,n)->userRow(r.getString("id"),r.getString("name"),r.getString("email"),r.getString("role"),r.getString("image"),r.getString("fitness_profile")),id)
                .stream().findFirst().orElseThrow(()->new ApiException(HttpStatus.NOT_FOUND,"Not found"));
    }
    public List<Map<String,Object>> recentUsers() { return db.query("SELECT id,name,email,role,created_at FROM users ORDER BY created_at DESC LIMIT 8",(r,n)->Map.of("id",r.getString("id"),"name",Objects.toString(r.getString("name"),""),"email",r.getString("email"),"role",r.getString("role"),"createdAt",r.getTimestamp("created_at").toInstant().toString())); }
    private Map<String,Object> userRow(String id,String name,String email,String role,String image,String profile) { Object data=null; try { if(profile!=null) {data=json.readValue(profile,new TypeReference<Object>(){});if(data instanceof String nested)data=json.readValue(nested,new TypeReference<Object>(){});} } catch(Exception ignored){} return publicUser(id,name,email,role,image,data); }
    private Map<String,Object> publicUser(String id,String name,String email,String role,String image) { return publicUser(id,name,email,role,image,null); }
    private Map<String,Object> publicUser(String id,String name,String email,String role,String image,Object profile) { Map<String,Object> u=new LinkedHashMap<>(); u.put("id",id);u.put("name",name);u.put("email",email);u.put("role",role);u.put("image",image);u.put("fitnessProfile",profile);return u; }
    private String write(Object value) { try{return json.writeValueAsString(value);}catch(Exception e){throw new ApiException(HttpStatus.BAD_REQUEST,"Invalid profile payload");} }
}
