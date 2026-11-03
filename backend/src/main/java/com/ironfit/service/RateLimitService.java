package com.ironfit.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {
    private record Bucket(long start,int count){}
    private final ConcurrentHashMap<String,Bucket> buckets=new ConcurrentHashMap<>();
    public boolean allow(String key,int max,long windowMs){long now=System.currentTimeMillis();Bucket b=buckets.compute(key,(k,old)->old==null||now-old.start()>=windowMs?new Bucket(now,1):new Bucket(old.start(),old.count()+1));if(buckets.size()>10000)buckets.entrySet().removeIf(e->now-e.getValue().start()>windowMs*2);return b.count()<=max;}
}
