package com.petscape.aspect;

import com.petscape.annotation.Auditable;
import com.petscape.entity.AuditLog;
import com.petscape.entity.User;
import com.petscape.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;


@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditAspect {

    private final AuditLogRepository auditLogRepository;

    @Around("@annotation(auditable)")
    public Object audit(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {

        Long userId = null;
        String userEmail = "anonymous";

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User user) {
            userId = user.getId();
            userEmail = user.getEmail();
        }

        Object result = null;
        String entityId = null;
        try {
            result = joinPoint.proceed();


            if (result != null) {
                try {
                    var method = result.getClass().getMethod("getId");
                    Object id = method.invoke(result);
                    if (id != null)
                        entityId = id.toString();
                } catch (NoSuchMethodException ignored) {
                    
                }
            }
        } finally {
            AuditLog auditEntry = AuditLog.builder()
                    .userId(userId)
                    .userEmail(userEmail)
                    .action(auditable.action())
                    .entityType(auditable.entityType().isBlank() ? null : auditable.entityType())
                    .entityId(entityId)
                    .details(buildDetails(joinPoint))
                    .timestamp(LocalDateTime.now())
                    .build();

            try {
                auditLogRepository.save(auditEntry);
            } catch (Exception e) {
                log.warn("Failed to persist audit log for action {}: {}", auditable.action(), e.getMessage());
            }
        }

        return result;
    }

    private String buildDetails(ProceedingJoinPoint joinPoint) {
        try {
            String method = joinPoint.getSignature().getName();
            String args = Arrays.stream(joinPoint.getArgs())
                    .map(a -> a == null ? "null" : a.getClass().getSimpleName())
                    .reduce((a, b) -> a + ", " + b)
                    .orElse("");
            return method + "(" + args + ")";
        } catch (Exception e) {
            return "";
        }
    }
}
