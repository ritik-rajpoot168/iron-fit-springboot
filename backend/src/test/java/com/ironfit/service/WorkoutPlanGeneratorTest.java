package com.ironfit.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;
import java.util.List;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

class WorkoutPlanGeneratorTest {
    @Test void createsSevenDaysAndRespectsRestDaysAndEquipment() {
        WorkoutPlanGenerator generator=new WorkoutPlanGenerator("","model",new ObjectMapper(),RestClient.builder());
        Map<String,Object> profile=new java.util.HashMap<>();profile.put("goal","Muscle Gain");profile.put("age","25");profile.put("weight","75");profile.put("height","175");profile.put("gender","Male");profile.put("level","Intermediate");profile.put("workoutType","Strength");profile.put("equipment","Dumbbells");profile.put("workoutDaysPerWeek","4");profile.put("sessionDuration","45");profile.put("activityLevel","Moderately Active");profile.put("sleepQuality","Good");profile.put("focusAreas",List.of("Chest","Back"));
        Map<String,Object> targets=Map.of("calorieTarget",2700,"proteinTarget",135);
        Map<String,Object> plan=generator.generate(profile,targets);
        List<?> schedule=(List<?>)plan.get("weeklySchedule");
        assertEquals(7,schedule.size());
        assertEquals(3,schedule.stream().filter(d->Boolean.TRUE.equals(((Map<?,?>)d).get("isRest"))).count());
        assertTrue(schedule.stream().filter(d->!Boolean.TRUE.equals(((Map<?,?>)d).get("isRest"))).allMatch(d->!((List<?>)((Map<?,?>)d).get("exercises")).isEmpty()));
        assertTrue(String.valueOf(plan.get("nutritionTip")).contains("2700 kcal/day"));
    }
}
