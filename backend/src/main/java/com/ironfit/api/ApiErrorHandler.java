package com.ironfit.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.Map;

@RestControllerAdvice
public class ApiErrorHandler {
    @ExceptionHandler(ApiException.class) ResponseEntity<Map<String,String>> api(ApiException e) { return ResponseEntity.status(e.status()).body(Map.of("error", e.getMessage())); }
    @ExceptionHandler(Exception.class) ResponseEntity<Map<String,String>> unexpected(Exception e) { return ResponseEntity.internalServerError().body(Map.of("error", "Request could not be completed")); }
}
