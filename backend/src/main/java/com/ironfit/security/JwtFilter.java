package com.ironfit.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {
    private final JwtService jwt;
    private final String bridgeSecret;
    public JwtFilter(JwtService jwt, @Value("${app.bridge.secret}") String bridgeSecret) { this.jwt = jwt; this.bridgeSecret = bridgeSecret; }
    @Override protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) throws ServletException, IOException {
        String h = req.getHeader("Authorization");
        if (h != null && h.startsWith("Bearer ")) {
            try {
                AppUser user = jwt.parse(h.substring(7));
                var auth = new UsernamePasswordAuthenticationToken(user, null, List.of(new SimpleGrantedAuthority("ROLE_" + user.role().toUpperCase())));
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (RuntimeException ignored) { SecurityContextHolder.clearContext(); }
        } else if (!bridgeSecret.isBlank()) {
            try {
                String id=req.getHeader("X-Ironfit-User"), email=req.getHeader("X-Ironfit-Email"), role=req.getHeader("X-Ironfit-Role");
                String timestamp=req.getHeader("X-Ironfit-Timestamp"), provided=req.getHeader("X-Ironfit-Signature");
                long issued=Long.parseLong(timestamp);
                if(id==null||role==null||provided==null||Math.abs(System.currentTimeMillis()/1000-issued)>60||!(role.equals("user")||role.equals("admin"))) throw new IllegalArgumentException("Invalid bridge identity");
                String payload=id+":"+(email==null?"":email)+":"+role+":"+timestamp;
                Mac mac=Mac.getInstance("HmacSHA256");mac.init(new SecretKeySpec(bridgeSecret.getBytes(StandardCharsets.UTF_8),"HmacSHA256"));
                String expected=java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
                if(!MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8),provided.getBytes(StandardCharsets.UTF_8))) throw new IllegalArgumentException("Invalid bridge signature");
                var user=new AppUser(id,email,role);
                var auth=new UsernamePasswordAuthenticationToken(user,null,List.of(new SimpleGrantedAuthority("ROLE_"+role.toUpperCase())));
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (Exception ignored) { SecurityContextHolder.clearContext(); }
        }
        chain.doFilter(req, res);
    }
}
