package com.hostelflow.repository;

import com.hostelflow.model.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    List<ChatMessage> findByConversationIdOrderByCreatedAtAsc(String conversationId);
    List<ChatMessage> findByConversationIdOrderByCreatedAtDesc(String conversationId);
    long countByRecipientIdAndIsReadFalse(String recipientId);
    long countByConversationIdAndRecipientIdAndIsReadFalse(String conversationId, String recipientId);
    List<ChatMessage> findBySenderIdOrRecipientId(String senderId, String recipientId);
}
