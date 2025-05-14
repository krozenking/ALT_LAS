# API Gateway Hata Listesi

## TypeScript Derleme Hataları

### Express Route Handler Hataları
1. `src/utils/monitoring.ts:148:23` - Express route handler tipi hatası (`app.get("/metrics", async (req, res) => {...})`)
2. `src/utils/monitoring.ts:189:22` - Express route handler tipi hatası (`app.get("/health", async (req, res) => {...})`)

### Default Export Hataları
3. `src/config/index.ts:1:8` - "dotenv" modülünün default export'u yok
4. `src/index.ts:6:8` - "swagger-ui-express" modülünün default export'u yok
5. `src/index.ts:9:8` - "http" modülünün default export'u yok
6. `src/middleware/authMiddleware.ts:2:8` - "jsonwebtoken" modülünün default export'u yok
7. `src/middleware/proxyMiddleware.ts:7:8` - "http" modülünün default export'u yok
8. `src/routes/authRoutes.ts:2:8` - "jsonwebtoken" modülünün default export'u yok
9. `src/routes/authRoutes.ts:3:8` - "bcrypt" modülünün default export'u yok
10. `src/routes/fileRoutes.ts:12:8` - "fs" modülünün default export'u yok
11. `src/routes/userRoutes.ts:7:8` - "bcrypt" modülünün default export'u yok
12. `src/services/authService.ts:13:8` - "crypto" modülünün default export'u yok
13. `src/services/jwtService.ts:1:8` - "jsonwebtoken" modülünün default export'u yok
14. `src/services/sessionService.ts:1:8` - "crypto" modülünün default export'u yok
15. `src/services/userService.ts:3:8` - "crypto" modülünün default export'u yok
16. `src/utils/monitoring.ts:2:8` - "prom-client" modülünün default export'u yok
17. `src/utils/routeLoader.ts:2:8` - "fs" modülünün default export'u yok

### esModuleInterop Hataları
18. `src/index.ts:2:8` - "express" modülü esModuleInterop flag'i olmadan default import edilemez
19. `src/index.ts:3:8` - "cors" modülü esModuleInterop flag'i olmadan default import edilemez
20. `src/index.ts:5:8` - "compression" modülü esModuleInterop flag'i olmadan default import edilemez
21. `src/index.ts:7:8` - "yamljs" modülü esModuleInterop flag'i olmadan default import edilemez
22. `src/index.ts:8:8` - "path" modülü esModuleInterop flag'i olmadan default import edilemez
23. `src/middleware/loggingMiddleware.ts:2:8` - "morgan" modülü esModuleInterop flag'i olmadan default import edilemez
24. `src/middleware/proxyMiddleware.ts:4:8` - "opossum" modülü esModuleInterop flag'i olmadan default import edilemez
25. `src/routes/commandRoutes.ts:1:8` - "express" modülü esModuleInterop flag'i olmadan default import edilemez
26. `src/routes/fileRoutes.ts:10:8` - "multer" modülü esModuleInterop flag'i olmadan default import edilemez
27. `src/routes/fileRoutes.ts:11:8` - "path" modülü esModuleInterop flag'i olmadan default import edilemez
28. `src/routes/userRoutes.ts:2:8` - "express" modülü esModuleInterop flag'i olmadan default import edilemez
29. `src/utils/logger.ts:1:8` - "winston" modülü esModuleInterop flag'i olmadan default import edilemez
30. `src/utils/monitoring.ts:3:8` - "response-time" modülü esModuleInterop flag'i olmadan default import edilemez
31. `src/utils/routeLoader.ts:3:8` - "path" modülü esModuleInterop flag'i olmadan default import edilemez

### Iterator Hataları
32. `src/services/commandService.ts:163:27` - MapIterator<Command> tipi '--downlevelIteration' flag'i olmadan iterate edilemez
33. `src/services/sessionService.ts:293:27` - Set<string> tipi '--downlevelIteration' flag'i olmadan iterate edilemez
34. `src/services/userService.ts:66:24` - MapIterator<User> tipi '--downlevelIteration' flag'i olmadan iterate edilemez
35. `src/services/userService.ts:117:23` - MapIterator<User> tipi '--downlevelIteration' flag'i olmadan iterate edilemez
36. `src/services/userService.ts:126:23` - MapIterator<User> tipi '--downlevelIteration' flag'i olmadan iterate edilemez

### Diğer Hatalar
37. `src/index.ts:88:3` - keyGenerator fonksiyonu string | number dönüyor, ancak sadece string dönmesi gerekiyor
38. `src/utils/redisClient.ts:59:9` - retryStrategy fonksiyonu boolean dönüyor, ancak number | void dönmesi gerekiyor
39. `src/utils/monitoring.ts:258:20` - healthStatus nesnesinde 'error' özelliği tanımlanmamış

## Çözüm Stratejisi

Hataları aşağıdaki sırayla çözeceğim:

1. Önce tsconfig.json dosyasını düzelterek esModuleInterop ve downlevelIteration flag'lerini etkinleştireceğim
2. Tip hatalarını düzelteceğim (keyGenerator, retryStrategy, healthStatus)
3. Express route handler hatalarını düzelteceğim
4. Default export hatalarını düzelteceğim

Her bir hatayı çözdükten sonra build işlemini tekrar çalıştırarak ilerlemeyi kontrol edeceğim.
