package com.petscape.config;

import com.petscape.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.Collections;

/**
 * WebSocket STOMP configuration.
 *
 * Flow:
 * 1. Client connects to /ws (with SockJS fallback).
 * 2. Client subscribes to /user/queue/notifications (private queue per user).
 * 3. Backend calls SimpMessagingTemplate.convertAndSendToUser(email,
 * "/queue/notifications", payload).
 * 4. Client receives the notification in real-time.
 *
 * JWT Auth:
 * The CONNECT frame must carry Authorization: Bearer <token> in STOMP headers.
 * JwtUtil validates the token and we set the authenticated principal on the
 * session.
 */
@Slf4j
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtUtil jwtUtil;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/queue", "/topic");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/ws")
            .setAllowedOriginPatterns("");
}

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authHeader = accessor.getFirstNativeHeader("Authorization");
                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7);
                        try {
                            if (jwtUtil.validateToken(token)) {
                                String email = jwtUtil.extractUsername(token);
                                // Set principal so Spring can route /user/{email}/queue/... correctly
                                var auth = new UsernamePasswordAuthenticationToken(
                                        email, null, Collections.emptyList());
                                accessor.setUser(auth);
                                log.debug("WebSocket CONNECT authenticated: {}", email);
                            }
                        } catch (Exception e) {
                            log.warn("WebSocket JWT validation failed: {}", e.getMessage());
                        }
                    }
                }
                return message;
            }
        });
    }
}
