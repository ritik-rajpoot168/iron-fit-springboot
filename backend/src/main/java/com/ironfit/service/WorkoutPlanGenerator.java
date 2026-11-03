package com.ironfit.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestClient;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;

/** Deterministic plan generator used whenever an external AI provider is not configured or unavailable. */
@Service
public class WorkoutPlanGenerator {
    private static final List<String> DAYS=List.of("Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday");
    private static final Map<String,List<String>> MOVEMENTS=Map.of(
        "Chest",List.of("Push-Up","Dumbbell Bench Press","Bench Press","Band Chest Press"),
        "Back",List.of("One-Arm Row","Lat Pulldown","Band Row","Reverse Snow Angel"),
        "Arms",List.of("Dumbbell Curl","Cable Pressdown","Band Curl","Close-Grip Push-Up"),
        "Legs",List.of("Goblet Squat","Romanian Deadlift","Reverse Lunge","Leg Press"),
        "Core",List.of("Dead Bug","Plank","Pallof Press","Side Plank"),
        "Mobility",List.of("Hip 90/90 Switch","Thoracic Rotation","Couch Stretch","Ankle Mobility Drill"));
    private final String anthropicKey, anthropicModel; private final ObjectMapper json; private final RestClient anthropic;
    public WorkoutPlanGenerator(@Value("${app.ai.anthropic-key:}") String key,@Value("${app.ai.anthropic-model:claude-sonnet-4-20250514}") String model,ObjectMapper json,RestClient.Builder builder){this.anthropicKey=key;this.anthropicModel=model;this.json=json;this.anthropic=builder.baseUrl("https://api.anthropic.com").build();}

    public Map<String,Object> generate(Map<String,Object> p, Map<String,Object> targets) {
        Map<String,Object> fallback=generateFallback(p,targets);
        if(anthropicKey.isBlank()) return fallback;
        try { return normalize(callAnthropic(p),fallback); } catch(Exception ignored) { return fallback; }
    }

    private Map<String,Object> generateFallback(Map<String,Object> p, Map<String,Object> targets) {
        String goal=str(p,"goal"), level=str(p,"level"), equipment=str(p,"equipment"), sleep=str(p,"sleepQuality");
        int n=(int)Math.round(Double.parseDouble(str(p,"workoutDaysPerWeek"))), duration=(int)Math.round(Double.parseDouble(str(p,"sessionDuration")));
        String age=str(p,"age");
        List<String> focus=((List<?>)p.get("focusAreas")).stream().map(String::valueOf).toList();
        List<String> areas=focus.contains("Full Body")?List.of("Chest","Back","Legs","Core"):focus.stream().filter(a->!a.equals("Full Body")).toList();
        if(areas.isEmpty()) areas=List.of("Chest","Back","Legs","Core");
        Set<Integer> rests=restDays(n); int seed=Math.abs(Objects.hash(p));
        List<Map<String,Object>> schedule=new ArrayList<>();
        for(int i=0;i<7;i++) {
            boolean rest=rests.contains(i); String area=areas.get(Math.floorMod(seed+i,areas.size()));
            List<Map<String,Object>> exercises=rest?List.of():exercises(area,goal,equipment,level,duration,seed+i);
            Map<String,Object> day=new LinkedHashMap<>(); day.put("day",DAYS.get(i));day.put("focus",rest?("Poor".equals(sleep)?"Recovery + Sleep Reset":"Mobility + Recovery"):(goal.equals("Fat Loss")&&i%2==1?area+" + Conditioning":area+" Focus"));
            day.put("isRest",rest);day.put("duration",rest?"20-30 min":duration+" min");day.put("warmup",rest?"Easy walk and gentle joint circles.":"8 minutes of easy movement, dynamic "+area.toLowerCase()+" prep, and one lighter practice set.");
            day.put("cooldown","5 minutes easy breathing, gentle stretching, and hydration.");day.put("intensity",intensity(level));day.put("coachNotes",rest?"Use this day to reduce fatigue, hydrate, and prepare for the next training session.":"Keep effort challenging but recoverable. Use clean technique and log your work.");day.put("exercises",exercises);schedule.add(day);
        }
        int calories=(int)Math.round(Double.parseDouble(str(p,"weight"))*duration*(level.equals("Elite")?8:level.equals("Advanced")?7:level.equals("Beginner")?5:6)*(goal.equals("Fat Loss")?1.2:goal.equals("Muscle Gain")?0.9:1)/60.0);
        Map<String,Object> plan=new LinkedHashMap<>(); plan.put("planName",title(goal,areas.get(seed%areas.size()),seed));
        String goalText=goalText(goal); plan.put("overview",goalText+" Built around "+n+" weekly sessions, "+duration+" min workouts, "+equipment+", and focus on "+String.join(", ",areas)+".");
        plan.put("goalSummary",goalText);plan.put("userProfileSummary",age+"y "+str(p,"gender")+", "+str(p,"height")+"cm, "+str(p,"weight")+"kg, "+level+" level.");plan.put("estimatedCaloriesBurned",calories+" kcal per workout estimate");plan.put("weeklyTrainingTarget",n+" sessions/week · "+duration+" min each · "+intensity(level)+" intensity");
        plan.put("weeklySchedule",schedule);plan.put("warmup","Start with easy cardio or movement prep, dynamic mobility, and a lighter practice set.");plan.put("cooldown","Finish with low-intensity breathing, gentle stretching for trained areas, and hydration.");
        plan.put("trainingNotes","Use proper form, stop 1-3 reps before failure on most sets, and progress gradually when all sets feel controlled.");plan.put("nutritionTip","Aim for "+targets.get("calorieTarget")+" kcal/day and "+targets.get("proteinTarget")+"g protein/day as a practical target for "+goal.toLowerCase()+".");
        plan.put("weeklyGoal",n+" completed sessions, no skipped warmups, and one measurable progression marker logged.");plan.put("recoveryRecommendations",sleep.equals("Poor")?"Keep intensity conservative, add a short walk on rest days, and prioritize recovery before increasing volume.":"Use rest days for light mobility, walking, hydration, and soreness management.");
        plan.put("sleepRecommendations",sleep.equals("Poor")?"Target a consistent bedtime and reduce late caffeine before increasing workout intensity.":"Maintain 7-9 hours of sleep and keep bedtime consistent around harder training days.");plan.put("dailyCalories",targets.get("calorieTarget")+" kcal/day");plan.put("proteinTarget",targets.get("proteinTarget")+"g/day");
        plan.put("hydrationGoal",Math.max(2.5,Math.round(Double.parseDouble(str(p,"weight"))*0.035*10)/10.0)+"L water/day");
        plan.put("progression",Map.of("week1to2","Learn technique, complete all planned sessions, and record baseline reps, load, or duration.","week3to4","Add 1-2 reps per set or 5-10% more time/load where form remains strong.","week5to8","Increase training density or load gradually, deload if recovery drops, and reassess body metrics."));
        plan.put("safety",Map.of("formTips","Keep neutral joints, brace before each rep, control tempo, and stop movements that cause sharp pain.","recoveryNotes","Respect rest days, warm up before sessions, and consult a qualified professional if you have medical issues or injuries."));
        return plan;
    }
    private Map<String,Object> callAnthropic(Map<String,Object> p) throws Exception {
        String prompt="Generate a personalized safe 7-day fitness plan as strict JSON only. Use the exact profile and shape below. Every weekday must appear once; rest days have isRest=true and empty exercises; match equipment, fitness level, goal, requested days and duration; include no diagnosis or treatment advice.\n"
                +"Profile: "+json.writeValueAsString(p)+"\nJSON fields: planName, overview, goalSummary, userProfileSummary, estimatedCaloriesBurned, weeklyTrainingTarget, weeklySchedule[{day,focus,isRest,duration,warmup,cooldown,intensity,coachNotes,exercises:[{name,sets,reps,rest,notes}]}], warmup, cooldown, trainingNotes, nutritionTip, weeklyGoal, recoveryRecommendations, sleepRecommendations, dailyCalories, proteinTarget, hydrationGoal, progression{week1to2,week3to4,week5to8}, safety{formTips,recoveryNotes}.";
        Map<?,?> response=anthropic.post().uri("/v1/messages").header("x-api-key",anthropicKey).header("anthropic-version","2023-06-01").header("Content-Type","application/json")
                .body(Map.of("model",anthropicModel,"max_tokens",4200,"messages",List.of(Map.of("role","user","content",prompt))))
                .retrieve().body(Map.class);
        if(response==null||!(response.get("content") instanceof List<?> blocks))throw new IllegalStateException("Empty AI response");
        String text=blocks.stream().filter(b->b instanceof Map<?,?> m&&"text".equals(m.get("type"))).map(b->String.valueOf(((Map<?,?>)b).get("text"))).reduce("",String::concat).trim();
        if(text.startsWith("```")){text=text.replaceFirst("^```(?:json)?\\s*","").replaceFirst("\\s*```$","");}
        return json.readValue(text,new TypeReference<Map<String,Object>>(){});
    }
    private Map<String,Object> normalize(Map<String,Object> candidate,Map<String,Object> fallback) {
        if(!(candidate.get("weeklySchedule") instanceof List<?> input)) return fallback;
        Map<String,Map<String,Object>> days=new HashMap<>();
        for(Object item:input) if(item instanceof Map<?,?> m&&m.get("day")!=null) days.put(String.valueOf(m.get("day")),cast(m));
        List<Map<String,Object>> base=(List<Map<String,Object>>)fallback.get("weeklySchedule"); List<Map<String,Object>> schedule=new ArrayList<>();
        for(Map<String,Object> fallbackDay:base){Map<String,Object> c=days.get(String.valueOf(fallbackDay.get("day")));if(c==null){schedule.add(fallbackDay);continue;}
            Map<String,Object> d=new LinkedHashMap<>(fallbackDay);for(String k:List.of("focus","duration","warmup","cooldown","intensity","coachNotes")){Object v=c.get(k);if(v instanceof String s&&!s.isBlank())d.put(k,s.substring(0,Math.min(s.length(),500)));}
            boolean rest=Boolean.TRUE.equals(c.get("isRest"));d.put("isRest",rest);if(rest)d.put("exercises",List.of());else d.put("exercises",normalizeExercises(c.get("exercises"),fallbackDay.get("exercises")));schedule.add(d);}
        long rest=schedule.stream().filter(x->Boolean.TRUE.equals(x.get("isRest"))).count();if(rest<1||rest>5)return fallback;
        Map<String,Object> out=new LinkedHashMap<>(fallback);for(String k:List.of("planName","overview","goalSummary","userProfileSummary","estimatedCaloriesBurned","weeklyTrainingTarget","warmup","cooldown","trainingNotes","nutritionTip","weeklyGoal","recoveryRecommendations","sleepRecommendations","dailyCalories","proteinTarget","hydrationGoal","progression","safety")){Object v=candidate.get(k);if(v!=null)out.put(k,v);}out.put("weeklySchedule",schedule);return out;
    }
    private List<Map<String,Object>> normalizeExercises(Object raw,Object defaultRaw){List<?> in=raw instanceof List<?> l?l:(List<?>)defaultRaw;List<Map<String,Object>> result=new ArrayList<>();for(Object x:in.stream().limit(7).toList()){if(!(x instanceof Map<?,?> m))continue;Map<String,Object> e=new LinkedHashMap<>();e.put("name",safe(m.get("name"),"Technique Practice",90));e.put("sets",Math.max(1,Math.min(6,integer(m.get("sets"),3))));e.put("reps",safe(m.get("reps"),"8-12",40));e.put("rest",safe(m.get("rest"),"60-90s",40));e.put("notes",safe(m.get("notes"),"Move with control.",180));result.add(e);}return result.isEmpty()?(List<Map<String,Object>>)defaultRaw:result;}
    private String safe(Object v,String def,int max){String s=v==null?def:String.valueOf(v).trim();if(s.isBlank())s=def;return s.substring(0,Math.min(max,s.length()));}
    private int integer(Object v,int def){try{return (int)Math.round(Double.parseDouble(String.valueOf(v)));}catch(Exception e){return def;}}
    private Map<String,Object> cast(Map<?,?> m){Map<String,Object> out=new LinkedHashMap<>();m.forEach((k,v)->out.put(String.valueOf(k),v));return out;}
    private List<Map<String,Object>> exercises(String area,String goal,String equipment,String level,int duration,int seed){
        List<String> names=new ArrayList<>(); names.add(pick(MOVEMENTS.get(area),seed)); names.add(pick(MOVEMENTS.get("Legs"),seed+1)); names.add(pick(MOVEMENTS.get("Back"),seed+2)); names.add(pick(MOVEMENTS.get("Core"),seed+3));
        if(goal.equals("Fat Loss")) names.add(equipment.equals("No Equipment")?"Brisk Walk Intervals":"Zone 2 Cardio"); else names.add(pick(MOVEMENTS.get("Arms"),seed+4));
        int sets=level.equals("Elite")?5:level.equals("Advanced")?4:3; String reps=level.equals("Beginner")?(goal.equals("Muscle Gain")?"8-12":"10-14"):goal.equals("Muscle Gain")?"6-12":"8-12";
        return names.stream().distinct().limit(6).map(name->{Map<String,Object> e=new LinkedHashMap<>();boolean cardio=name.contains("Cardio")||name.contains("Walk");e.put("name",name);e.put("sets",cardio?1:sets);e.put("reps",cardio?Math.max(15,duration-15)+" min":reps);e.put("rest",cardio?"as needed":"60-90s");e.put("notes",cardio?"Keep a conversational pace and adjust effort to your fitness level.":"Move with control and stop before form breaks.");return e;}).toList();
    }
    private Set<Integer> restDays(int n){return switch(n){case 2->Set.of(1,2,4,5,6);case 3,4->Set.of(2,4,6);case 5->Set.of(3,6);default->Set.of(6);};}
    private String intensity(String level){return switch(level){case "Elite"->"High";case "Advanced"->"High";case "Beginner"->"Low-Moderate";default->"Moderate";};}
    private String title(String goal,String area,int seed){String[] v={"Forge","Prime","Pulse","Apex","Vector","Momentum","Foundation","Engine"};return v[Math.floorMod(seed,v.length)]+" "+goal+" "+area+" Plan";}
    private String goalText(String g){return switch(g){case "Fat Loss"->"Create a sustainable calorie-burning week with strength work, conditioning, and enough recovery to keep adherence high.";case "Muscle Gain"->"Build muscle through progressive overload, focused volume, controlled tempo, and planned recovery.";case "Recomposition"->"Balance hypertrophy work and conditioning to improve strength, muscle tone, and body composition.";default->"Improve strength, mobility, conditioning, and weekly consistency with a balanced training structure.";};}
    private String pick(List<String> xs,int i){return xs.get(Math.floorMod(i,xs.size()));}
    private String str(Map<String,Object> p,String k){return String.valueOf(p.get(k));}
}
