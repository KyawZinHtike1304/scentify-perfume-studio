package com.scentify.api;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

@Component
public class CurrentUser {
  public UUID id(Authentication authentication) {
    if (authentication == null || !authentication.isAuthenticated()) {
      throw new IllegalStateException("Authentication is required.");
    }
    return UUID.fromString(authentication.getName());
  }

  public void requireStaff(Authentication authentication) {
    requireRole(authentication, false);
  }

  public void requireAdmin(Authentication authentication) {
    requireRole(authentication, true);
  }

  private void requireRole(Authentication authentication, boolean adminOnly) {
    if (!(authentication instanceof JwtAuthenticationToken jwtAuthentication)) {
      throw new IllegalStateException("A staff JWT is required.");
    }
    Object metadata = jwtAuthentication.getToken().getClaims().get("app_metadata");
    if (!(metadata instanceof Map<?, ?> appMetadata)) {
      throw new IllegalStateException("Staff role is required.");
    }
    Object role = appMetadata.get("role");
    if (adminOnly ? !"admin".equals(role)
        : (!"admin".equals(role) && !"staff".equals(role) && !"perfumer".equals(role))) {
      throw new IllegalStateException("Staff role is required.");
    }
  }
}
