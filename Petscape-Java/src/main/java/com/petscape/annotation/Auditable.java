package com.petscape.annotation;

import java.lang.annotation.*;

/**
 * Marks a service method for automatic audit logging via {@code AuditAspect}.
 * Place on any state-changing method (create / update / delete / status
 * changes).
 *
 * <p>
 * Example:
 * 
 * <pre>{@code
 * &#64;Auditable(action = "CREATE_ANIMAL", entityType = "Animal")
 * public AnimalResponse create(AnimalRequest request) { ... }
 * }</pre>
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Auditable {

    /** Human-readable action label, e.g. "CREATE_ANIMAL", "APPROVE_ADOPTION" */
    String action();

    /** Entity type affected, e.g. "Animal", "AdoptionRequest" */
    String entityType() default "";
}
