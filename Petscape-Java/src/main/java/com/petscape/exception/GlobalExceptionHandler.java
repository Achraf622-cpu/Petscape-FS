package com.petscape.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;


@RestControllerAdvice
public class GlobalExceptionHandler {

    // ─── Domain errors ────────────────────────────────────────────────────────

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex) {
        return error(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiError> handleBadRequest(BadRequestException ex) {
        return error(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ApiError> handleForbidden(ForbiddenException ex) {
        return error(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    // ─── Spring Security ──────────────────────────────────────────────────────

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(AccessDeniedException ex) {
        return error(HttpStatus.FORBIDDEN, "Access denied");
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiError> handleBadCredentials(BadCredentialsException ex) {
        return error(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    // ─── Bean Validation ──────────────────────────────────────────────────────

    @ExceptionHandler(org.springframework.web.method.annotation.HandlerMethodValidationException.class)
    public ResponseEntity<ApiError> handleHandlerMethodValidation(org.springframework.web.method.annotation.HandlerMethodValidationException ex) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        ex.getAllValidationResults().forEach(result -> {
            result.getResolvableErrors().forEach(err -> {
                if (err instanceof FieldError fieldError) {
                    fieldErrors.put(fieldError.getField(), err.getDefaultMessage());
                } else {
                    fieldErrors.put(result.getMethodParameter().getParameterName(), err.getDefaultMessage());
                }
            });
        });
        ApiError body = new ApiError(
                HttpStatus.UNPROCESSABLE_ENTITY.value(),
                "Validation failed",
                LocalDateTime.now(),
                fieldErrors);
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(body);
    }

    @ExceptionHandler({MethodArgumentNotValidException.class, org.springframework.validation.BindException.class})
    public ResponseEntity<ApiError> handleValidation(Exception ex) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        org.springframework.validation.BindingResult bindingResult;
        
        if (ex instanceof MethodArgumentNotValidException) {
            bindingResult = ((MethodArgumentNotValidException) ex).getBindingResult();
        } else {
            bindingResult = ((org.springframework.validation.BindException) ex).getBindingResult();
        }
        
        bindingResult.getAllErrors().forEach(err -> {
            String field = err instanceof FieldError ? ((FieldError) err).getField() : err.getObjectName();
            fieldErrors.put(field, err.getDefaultMessage());
        });
        
        ApiError body = new ApiError(
                HttpStatus.UNPROCESSABLE_ENTITY.value(),
                "Validation failed",
                LocalDateTime.now(),
                fieldErrors);
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(body);
    }

    // ─── File upload ──────────────────────────────────────────────────────────

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiError> handleFileTooLarge(MaxUploadSizeExceededException ex) {
        return error(HttpStatus.PAYLOAD_TOO_LARGE, "File size exceeds the maximum allowed limit (5 MB)");
    }

    // ─── Catch-all ────────────────────────────────────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneral(Exception ex) {
        ex.printStackTrace();
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred");
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private ResponseEntity<ApiError> error(HttpStatus status, String message) {
        return ResponseEntity.status(status)
                .body(new ApiError(status.value(), message, LocalDateTime.now(), null));
    }

    /**
     * Unified error envelope — always the same shape so Angular can type it safely.
     * {@code errors} is null for non-validation errors (omitted from JSON by
     * Jackson).
     */
    public record ApiError(
            int status,
            String message,
            LocalDateTime timestamp,
            Map<String, String> errors) {
    }
}
