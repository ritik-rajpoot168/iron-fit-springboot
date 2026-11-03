package com.ironfit.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties={
        "spring.datasource.url=jdbc:h2:mem:ironfit;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "app.jwt.secret=test-secret-for-ironfit-jwt-signing-at-least-32-bytes-long",
        "app.bridge.secret=test-bridge-secret-for-integration-tests"
})
class WorkoutApiIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;

    @Test void registersAuthenticatesAndPersistsAUserScopedPlan() throws Exception {
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Test Athlete\",\"email\":\"athlete@example.test\",\"password\":\"password123\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.user.email").value("athlete@example.test"));

        String login=mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"athlete@example.test\",\"password\":\"password123\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.token").isNotEmpty()).andReturn().getResponse().getContentAsString();
        JsonNode auth=json.readTree(login);String bearer="Bearer "+auth.path("token").asText();

        mvc.perform(get("/api/auth/me").header("Authorization",bearer))
                .andExpect(status().isOk()).andExpect(jsonPath("$.user.name").value("Test Athlete"));

        String profile="{\"goal\":\"General Fitness\",\"age\":\"25\",\"weight\":\"75\",\"height\":\"175\",\"gender\":\"Male\",\"level\":\"Intermediate\",\"workoutType\":\"Strength\",\"equipment\":\"Full Gym\",\"workoutDaysPerWeek\":\"4\",\"sessionDuration\":\"45\",\"activityLevel\":\"Moderately Active\",\"sleepQuality\":\"Good\",\"focusAreas\":[\"Full Body\"]}";
        String save="{\"profile\":"+profile+",\"plan\":{\"planName\":\"Starter Plan\",\"weeklySchedule\":[]}}";
        mvc.perform(post("/api/plans").header("Authorization",bearer).contentType(MediaType.APPLICATION_JSON).content(save))
                .andExpect(status().isOk()).andExpect(jsonPath("$.plan.name").value("Starter Plan"))
                .andExpect(jsonPath("$.plan.progress.completedDays.length()").value(0));
        mvc.perform(get("/api/plans").header("Authorization",bearer))
                .andExpect(status().isOk()).andExpect(jsonPath("$.plans.length()").value(1));
    }

    @Test void rejectsDuplicateRegistrationAndUnauthenticatedPlanReads() throws Exception {
        mvc.perform(get("/api/plans")).andExpect(status().isUnauthorized());
        String user="{\"name\":\"Test Athlete\",\"email\":\"duplicate@example.test\",\"password\":\"password123\"}";
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(user)).andExpect(status().isOk());
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(user)).andExpect(status().isConflict());
    }

    @Test void acceptsTheSignedIdentityUsedByTheNextProxy() throws Exception {
        String registered=mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Bridge Athlete\",\"email\":\"bridge@example.test\",\"password\":\"password123\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        String id=json.readTree(registered).path("user").path("id").asText();
        String timestamp=String.valueOf(System.currentTimeMillis()/1000), email="bridge@example.test", role="user";
        Mac mac=Mac.getInstance("HmacSHA256");mac.init(new SecretKeySpec("test-bridge-secret-for-integration-tests".getBytes(StandardCharsets.UTF_8),"HmacSHA256"));
        String signature=Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal((id+":"+email+":"+role+":"+timestamp).getBytes(StandardCharsets.UTF_8)));
        mvc.perform(get("/api/auth/me").header("X-Ironfit-User",id).header("X-Ironfit-Email",email).header("X-Ironfit-Role",role)
                        .header("X-Ironfit-Timestamp",timestamp).header("X-Ironfit-Signature",signature))
                .andExpect(status().isOk()).andExpect(jsonPath("$.user.id").value(id));
    }
}
