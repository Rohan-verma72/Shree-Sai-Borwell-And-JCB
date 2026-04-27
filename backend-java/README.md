# Java + Oracle backend scaffold

This folder contains a starter Spring Boot backend for the current Next.js rental app.

## What is included

- `GET /api/equipment`
- `GET /api/bookings`
- `POST /api/bookings`
- `PATCH /api/bookings/{id}`
- `GET /api/stats`
- Oracle JDBC + Spring Data JPA configuration
- Entity model for `equipment` and `bookings`
- Service logic that mirrors the current file-based rules from `src/data/db.ts`
- Startup seed loader that imports `seed-data.json` into an empty Oracle database

## What still needs to be done

1. Install Maven or generate a Maven wrapper.
2. Create an Oracle database and update `src/main/resources/application.properties`.
   On this machine, `lsnrctl status` showed the local PDB service as `orclpdb`, so the default JDBC URL was updated accordingly.
   The datasource username is now set to `C##ROHAN`; replace `CHANGE_ME` with that schema's real password before starting the app.
3. Verify or replace `src/main/resources/seed-data.json` with your production-ready starter data.
4. Add `JAVA_API_BASE_URL=http://localhost:8080` to the Next.js app `.env.local`.
5. Adjust `app.frontend-url` in the Spring Boot config if your frontend runs on a different origin.
6. Disable `app.seed.enabled` after first import if you do not want startup seeding behavior.

## Notes

- Current availability and dashboard stats are computed dynamically in the service layer.
- Booking ids now use `BK-XXXXXXXX` generated from a UUID fragment.
- Response DTOs already map enum values back into frontend-friendly labels like `Pending`, `Confirmed`, `Poclain`, and `Maintenance Required`.
- The Next.js app now supports a bridge mode: when `JAVA_API_BASE_URL` is set, its route handlers and server pages proxy to the Java backend; otherwise they keep using the local JSON store.
