package com.scentify.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/staff")
@Profile("!local")
public class StaffController {
  private final RestClient restClient;
  private final CurrentUser currentUser;
  private final String serviceRoleKey;

  public StaffController(
      RestClient.Builder restClientBuilder,
      CurrentUser currentUser,
      @Value("${SUPABASE_URL:}") String supabaseUrl,
      @Value("${SUPABASE_SERVICE_ROLE_KEY:}") String serviceRoleKey
  ) {
    this.restClient = restClientBuilder.baseUrl(supabaseUrl + "/auth/v1/admin/users").build();
    this.currentUser = currentUser;
    this.serviceRoleKey = serviceRoleKey;
  }

  @PostMapping
  public StaffResponse save(Authentication authentication, @Valid @RequestBody StaffRequest request) {
    currentUser.requireAdmin(authentication);
    requireConfigured();

    if ("disable".equals(request.action())) {
      if (request.userId() == null || request.userId().isBlank()) {
        throw new IllegalArgumentException("A user ID is required to disable staff.");
      }
      Map<?, ?> response = restClient.put().uri("/{id}", request.userId())
          .body(Map.of("ban_duration", "876000h"))
          .header("apikey", serviceRoleKey)
          .header("Authorization", "Bearer " + serviceRoleKey)
          .retrieve().body(Map.class);
      return new StaffResponse(request.userId());
    }

    Map<String, Object> body = Map.of(
        "email", request.email().trim().toLowerCase(),
        "email_confirm", true,
        "app_metadata", Map.of("role", request.role()),
        "user_metadata", Map.of(
            "display_name", request.name().trim(),
            "title", request.title().trim(),
            "phone", request.phone().trim()
        )
    );

    Map<?, ?> response;
    if ("create".equals(request.action())) {
      response = restClient.post().body(withPassword(body, request.password()))
          .header("apikey", serviceRoleKey)
          .header("Authorization", "Bearer " + serviceRoleKey)
          .retrieve().body(Map.class);
    } else if ("update".equals(request.action())) {
      if (request.userId() == null || request.userId().isBlank()) {
        throw new IllegalArgumentException("A user ID is required to update staff.");
      }
      response = restClient.put().uri("/{id}", request.userId()).body(withOptionalPassword(body, request.password()))
          .header("apikey", serviceRoleKey)
          .header("Authorization", "Bearer " + serviceRoleKey)
          .retrieve().body(Map.class);
    } else {
      throw new IllegalArgumentException("Invalid staff action.");
    }

    Object id = response == null ? null : response.get("id");
    if (id == null) {
      throw new IllegalStateException("Supabase Auth did not return a staff user ID.");
    }
    return new StaffResponse(id.toString());
  }

  private Map<String, Object> withPassword(Map<String, Object> body, String password) {
    if (password == null || password.length() < 6) {
      throw new IllegalArgumentException("Staff passwords must be at least 6 characters.");
    }
    return new java.util.HashMap<>(Map.of("password", password)) {{
      putAll(body);
    }};
  }

  private Map<String, Object> withOptionalPassword(Map<String, Object> body, String password) {
    Map<String, Object> result = new java.util.HashMap<>(body);
    if (password != null && !password.isBlank()) {
      if (password.length() < 6) {
        throw new IllegalArgumentException("Staff passwords must be at least 6 characters.");
      }
      result.put("password", password);
    }
    return result;
  }

  private void requireConfigured() {
    if (serviceRoleKey.isBlank()) {
      throw new IllegalStateException("Staff account provisioning is not configured.");
    }
  }

  public record StaffRequest(
      @NotBlank String action,
      String userId,
      @NotBlank String name,
      @NotBlank @Email String email,
      String password,
      @NotBlank String role,
      @NotBlank String title,
      @NotNull String phone
  ) {
  }

  public record StaffResponse(String userId) {
  }
}
