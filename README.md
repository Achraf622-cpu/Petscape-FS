# PetScape

PetScape is a comprehensive full-stack application designed for pet management, adoptions, and care services.

## Overview

This repository contains two main modules:

- **Petscape-Java**: The robust Spring Boot backend serving a RESTful API, handling database communication, security (JWT), and external integrations (Stripe, SMTP).
- **PetScape-Angular**: The dynamic frontend built with Angular, providing a modern, responsive user interface for users and administrators.

## Features

- **User Authentication**: Secure login and registration using JWT.
- **Pet Management**: Browse, adopt, and manage pets.
- **Stripe Integration**: Secure payment processing for donations.
- **Admin Dashboard**: Comprehensive dashboard to manage users, pets, and application functionality.

## Requirements

- Java 17+
- Node.js 18+
- PostgreSQL
- Docker (optional)

## Setup & Running

1. Set up the environment variables by referencing `.env.example`.
2. Start the backend with Maven or Docker Compose.
3. Start the frontend utilizing Angular CLI (`ng serve`).
