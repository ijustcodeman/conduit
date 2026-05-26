**Problem:**
We do not have request validation yet. TypeScript DTO types disappear at runtime, so Nest does not automatically reject bad request bodies.

**TODO:**
Add runtime DTO validation with class-validator / class-transformer and a global ValidationPipe, then handle duplicate username cleanly.

