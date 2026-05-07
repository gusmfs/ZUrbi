# Error Handling

## Standard error response format
```json
{
  "status": 400,
  "mensagem": "Campo email é obrigatório",
  "timestamp": "2026-05-01T14:30:00"
}
```

## Exception map

| Exception | HTTP Status | When |
|-----------|-------------|------|
| `ResourceNotFoundException` | 404 | Entity not found by ID |
| `IllegalArgumentException` | 400 | Invalid input (wrong file type, empty file) |
| `MethodArgumentNotValidException` | 400 | DTO validation failed (@NotBlank, @NotNull) |
| `Exception` (generic) | 500 | Unexpected error |

## GlobalExceptionHandler

Located at `shared/exception/GlobalExceptionHandler.java`  
Annotated with `@RestControllerAdvice`  
All handlers return `ResponseEntity<Map<String, Object>>`

```java
// Pattern for each handler
Map<String, Object> body = new LinkedHashMap<>();
body.put("status", httpStatus.value());
body.put("mensagem", ex.getMessage());
body.put("timestamp", LocalDateTime.now());
return ResponseEntity.status(httpStatus).body(body);
```

## ResourceNotFoundException

```java
// Usage in Service
throw new ResourceNotFoundException("Usuário não encontrado: " + id);
throw new ResourceNotFoundException("Órgão não encontrado para categoria: " + categoria);
throw new ResourceNotFoundException("Ocorrência não encontrada: " + id);
```

## StorageService errors

Storage failures throw `RuntimeException` with descriptive message.  
These bubble up to the generic 500 handler.  
Always log with `log.error()` before throwing.

## Validation errors (400)

DTO fields annotated with:
- `@NotBlank` → null or empty string
- `@NotNull` → null value
- `@Email` → invalid email format
- `@Positive` → must be > 0 (prazoResolucaoHoras)

Validation triggered automatically by `@Valid` in controller method signature.
