package com.scentify.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "profiles")
public class Profile {
  @Id
  private UUID id;

  @Column(name = "display_name", nullable = false)
  private String displayName;

  @Column(name = "shipping_address", nullable = false, columnDefinition = "jsonb")
  private String shippingAddress;

  @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
  private OffsetDateTime createdAt;

  @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
  private OffsetDateTime updatedAt;

  protected Profile() {
  }

  public Profile(UUID id, String displayName, String shippingAddress) {
    this.id = id;
    this.displayName = displayName;
    this.shippingAddress = shippingAddress;
  }

  public UUID getId() {
    return id;
  }

  public String getDisplayName() {
    return displayName;
  }

  public void setDisplayName(String displayName) {
    this.displayName = displayName;
  }

  public String getShippingAddress() {
    return shippingAddress;
  }

  public void setShippingAddress(String shippingAddress) {
    this.shippingAddress = shippingAddress;
  }
}
