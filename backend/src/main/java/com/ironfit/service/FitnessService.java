package com.ironfit.service;

import com.ironfit.api.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class FitnessService {
    public static final List<String> GOALS=List.of("Fat Loss","Muscle Gain","Recomposition","General Fitness");
    public static final List<String> LEVELS=List.of("Beginner","Intermediate","Advanced","Elite");
    public static final List<String> TYPES=List.of("Strength","HIIT","Cardio","Mobility","Yoga");
    public static final List<String> EQUIPMENT=List.of("Full Gym","Home Gym","Dumbbells","Resistance Bands","No Equipment","Gym","Home");
    public static final List<String> GENDERS=List.of("Male","Female","Other");
    public static final List<String> ACTIVITY=List.of("Sedentary","Lightly Active","Moderately Active","Very Active");
    public static final List<String> SLEEP=List.of("Poor","Average","Good","Excellent");
    public static final List<String> FOCUS=List.of("Chest","Back","Arms","Legs","Core","Full Body","Mobility");

    public Map<String,Object> validateProfile(Object raw) {
        if(!(raw instanceof Map<?,?> source)) throw bad("Check your profile inputs and try again.");
        Map<String,Object> p=new LinkedHashMap<>(); source.forEach((k,v)->p.put(String.valueOf(k),v));
        choice(p,"goal",GOALS); choice(p,"level",LEVELS); choice(p,"workoutType",TYPES); choice(p,"equipment",EQUIPMENT); choice(p,"gender",GENDERS);
        number(p,"age",16,80,false); number(p,"weight",40,160,false); number(p,"height",140,210,false);
        p.putIfAbsent("workoutDaysPerWeek","4"); p.putIfAbsent("sessionDuration","45"); p.putIfAbsent("activityLevel","Moderately Active"); p.putIfAbsent("sleepQuality","Good");
        number(p,"workoutDaysPerWeek",2,6,false); number(p,"sessionDuration",20,120,false); choice(p,"activityLevel",ACTIVITY); choice(p,"sleepQuality",SLEEP);
        Object areas=p.getOrDefault("focusAreas",List.of("Full Body"));
        if(!(areas instanceof List<?> list)||list.isEmpty()||list.size()>4||list.stream().anyMatch(a->!FOCUS.contains(String.valueOf(a)))) throw bad("Check your profile inputs and try again.");
        p.put("focusAreas",areas); return p;
    }
    private void choice(Map<String,Object> p,String key,List<String> choices){if(!choices.contains(String.valueOf(p.get(key))))throw bad("Check your profile inputs and try again.");}
    private double number(Map<String,Object> p,String key,double min,double max,boolean optional){Object v=p.get(key);if(v==null&&optional)return 0;try{double d=Double.parseDouble(String.valueOf(v));if(!Double.isFinite(d)||d<min||d>max)throw new NumberFormatException();return d;}catch(Exception e){throw bad("Check your profile inputs and try again.");}}
    private ApiException bad(String m){return new ApiException(HttpStatus.BAD_REQUEST,m);}

    public double bmi(Object weight,Object height){double w=Double.parseDouble(String.valueOf(weight)),h=Double.parseDouble(String.valueOf(height))/100;return Math.round(w/(h*h)*10.0)/10.0;}
    public Map<String,Object> targets(Map<String,Object> p){double w=Double.parseDouble(String.valueOf(p.get("weight"))),h=Double.parseDouble(String.valueOf(p.get("height"))),age=Double.parseDouble(String.valueOf(p.get("age")));
        double bmi=bmi(w,h);int bmr=(int)Math.round(10*w+6.25*h-5*age+("Female".equals(p.get("gender"))?-161:5));
        double factor=switch(String.valueOf(p.get("level"))){case "Elite"->1.725;case "Advanced"->1.55;case "Intermediate"->1.45;default->1.35;};int tdee=(int)Math.round(bmr*factor);
        int calories=Math.max(1200,tdee+switch(String.valueOf(p.get("goal"))){case "Fat Loss"->-400;case "Muscle Gain"->250;case "Recomposition"->-100;default->0;});
        double pm=("Muscle Gain".equals(p.get("goal"))||"Recomposition".equals(p.get("goal")))?1.8:1.6;
        return Map.of("bmi",bmi,"bmr",bmr,"tdee",tdee,"calorieTarget",calories,"proteinTarget",(int)Math.round(w*pm),"bmiLabel",bmiLabel(bmi));}
    public String bmiLabel(double b){if(b==0)return "Unknown";if(b<18.5)return "Underweight";if(b<25)return "Healthy";if(b<30)return "Overweight";return "High";}
}
