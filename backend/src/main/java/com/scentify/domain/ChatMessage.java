package com.scentify.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "studio_chat_messages")
public class ChatMessage {
  @Id
  private UUID id;

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Column(name = "sender_id", nullable = false)
  private UUID senderId;

  @Column(name = "sender_role", nullable = false)
  private String senderRole;

  @Column(nullable = false)
  private String message;

  @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
  private OffsetDateTime createdAt;

  protected ChatMessage() {
  }

  public ChatMessage(UUID userId, UUID senderId, String senderRole, String message) {
    this.id = UUID.randomUUID();
    this.userId = userId;
    this.senderId = senderId;
    this.senderRole = senderRole;
    this.message = message;
  }

  public UUID getId() {
    return id;
  }

  public UUID getUserId() {
    return userId;
  }

  public UUID getSenderId() {
    return senderId;
  }

  public String getSenderRole() {
    return senderRole;
  }

  public String getMessage() {
    return message;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }
}
