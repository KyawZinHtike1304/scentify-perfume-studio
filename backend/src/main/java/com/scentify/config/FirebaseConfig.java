package com.scentify.config;

import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FirebaseConfig {
  @Bean
  FirebaseApp firebaseApp() {
    if (FirebaseApp.getApps().isEmpty()) {
      return FirebaseApp.initializeApp(FirebaseOptions.builder().build());
    }
    return FirebaseApp.getInstance();
  }
}
