# 🐾 PetScape Frontend Architecture

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

Welcome to the **PetScape SPA** — the comprehensive, high-performance Angular client that powers the PetScape pet adoption and management ecosystem.

## 🚀 Features at a Glance
- **Community Adoption Engine:** Browse and filter hundreds of adorable pets awaiting their forever homes.
- **Lost & Found Reporting:** Rapid crowdsourced reporting interface to unite lost pets with their owners.
- **Veterinary Appointment Booking:** Embedded dynamic scheduling engine for medical exams.
- **Admin Control Matrix:** A fully insulated backoffice portal governing user roles, animals, adoptions, and robust system metrics.
- **Real-Time Websocket Streams:** Live telemetry and community alerts pushed directly into the localized toast engine.

## 🏗️ Architecture Stack
* **Framework:** Angular 17+ (Standalone Components, Signals, RxJS)
* **Styling Engine:** Tailwind CSS (Strict Utility-First)
* **State Management:** Reactive Component State via BehaviorSubjects & HTTP Interceptors
* **Real-time Engine:** SockJS + STOMP over Websockets

## 🛠️ Local Development Server

Run exactly these commands to spin up the local development instance.

```bash
# Install the necessary payload dependencies
npm install

# Boot the local Angular development engine at http://localhost:4200/
ng serve
```

## 🐋 Production Docker Engine
For robust containerized production deployments, leverage the embedded multi-stage Dockerfile containing optimized Nginx configurations:
```bash
docker build -t petscape-frontend .
docker run -p 80:80 petscape-frontend
```

---
*Built sequentially to solve the modern pet welfare crisis.*
