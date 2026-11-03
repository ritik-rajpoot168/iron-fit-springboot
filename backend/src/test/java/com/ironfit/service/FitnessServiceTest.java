package com.ironfit.service;

import com.ironfit.api.ApiException;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

class FitnessServiceTest {
    private final FitnessService fitness = new FitnessService();
    private Map<String,Object> profile() { Map<String,Object> p=new java.util.HashMap<>();p.put("goal","General Fitness");p.put("age","25");p.put("weight","75");p.put("height","175");p.put("gender","Male");p.put("level","Intermediate");p.put("workoutType","Strength");p.put("equipment","Full Gym");p.put("workoutDaysPerWeek","4");p.put("sessionDuration","45");p.put("activityLevel","Moderately Active");p.put("sleepQuality","Good");p.put("focusAreas",List.of("Full Body"));return p; }

    @Test void calculatesBmiAndNutritionTargets() {
        Map<String,Object> targets=fitness.targets(fitness.validateProfile(profile()));
        assertEquals(24.5,targets.get("bmi"));
        assertEquals(1724,targets.get("bmr"));
        assertEquals(2500,targets.get("tdee"));
        assertEquals(120,targets.get("proteinTarget"));
        assertEquals("Healthy",targets.get("bmiLabel"));
    }

    @Test void rejectsOutOfRangeAge() {
        Map<String,Object> profile=profile(); profile.put("age","15");
        assertThrows(ApiException.class,()->fitness.validateProfile(profile));
    }

    @Test void appliesDefaultsToOptionalProfileFields() {
        Map<String,Object> profile=profile(); profile.remove("workoutDaysPerWeek"); profile.remove("sessionDuration"); profile.remove("sleepQuality");
        Map<String,Object> validated=fitness.validateProfile(profile);
        assertEquals("4",validated.get("workoutDaysPerWeek"));
        assertEquals("45",validated.get("sessionDuration"));
        assertEquals("Good",validated.get("sleepQuality"));
    }
}
