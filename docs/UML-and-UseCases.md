# PetsCape — UML & Use Cases

## 1. Class diagram (Mermaid)

Paste the code below into **Mermaid Live Editor**  
https://mermaid.live  

or any tool that supports Mermaid (e.g. GitHub, GitLab, Notion, VS Code with Mermaid extension).

```mermaid
classDiagram
    class User {
        +Long id
        +String firstname
        +String lastname
        +String email
        +String password
        +Role role
        +String phone
        +Boolean banned
        +LocalDateTime createdAt
    }

    class Species {
        +Long id
        +String name
        +String description
    }

    class Animal {
        +Long id
        +String name
        +String breed
        +Integer age
        +String description
        +AnimalStatus status
        +List~String~ images
        +String location
    }

    class AdoptionRequest {
        +Long id
        +AdoptionStatus status
        +String message
        +LocalDateTime createdAt
    }

    class Appointment {
        +Long id
        +LocalDateTime dateTime
        +AppointmentStatus status
        +String notes
    }

    class AnimalReport {
        +Long id
        +String name
        +String breed
        +String description
        +String location
        +Double latitude
        +Double longitude
        +Boolean isFound
        +ReportStatus status
        +String image
    }

    class Notification {
        +Long id
        +String title
        +String message
        +NotificationType type
        +Boolean read
    }

    class Donation {
        +Long id
        +BigDecimal amount
        +String stripeSessionId
        +DonationStatus status
    }

    User "1" --> "*" AdoptionRequest : submits
    User "1" --> "*" Appointment : books
    User "1" --> "*" AnimalReport : creates
    User "1" --> "*" Notification : receives
    User "1" --> "*" Donation : makes

    Species "1" --> "*" Animal : has
    Species "1" --> "*" AnimalReport : used in

    Animal "1" --> "*" AdoptionRequest : has
    Animal "1" --> "*" Appointment : has
```

---

## 2. Use case diagram

Mermaid does not support standard UML use case diagrams (actors, ovals, system boundary). Use one of the options below.

### Option A — PlantUML (recommended)

1. Open **PlantUML online**: https://www.plantuml.com/plantuml/uml/
2. Paste the code below.
3. Export as PNG/SVG or copy the image.

```plantuml
@startuml PetsCape Use Cases
left to right direction
skinparam packageStyle rectangle
actor "Visitor" as V
actor "User" as U
actor "Admin" as A

rectangle "PetsCape" {
  usecase "Browse animals" as UC1
  usecase "View animal details" as UC2
  usecase "View reports (lost/found)" as UC3
  usecase "View stats" as UC4
  usecase "Take quiz" as UC5

  usecase "Register / Login" as UC6
  usecase "View profile" as UC7
  usecase "Submit adoption request" as UC8
  usecase "Book appointment" as UC9
  usecase "Submit lost/found report" as UC10
  usecase "Mark report as resolved" as UC11
  usecase "View my adoptions" as UC12
  usecase "View my appointments" as UC13
  usecase "View my reports" as UC14
  usecase "View notifications" as UC15
  usecase "Donate" as UC16

  usecase "Manage animals (CRUD)" as UC17
  usecase "Manage species" as UC18
  usecase "Approve/Reject adoptions" as UC19
  usecase "Confirm/Cancel appointments" as UC20
  usecase "Manage users (ban)" as UC21
  usecase "View donations" as UC22
  usecase "View audit logs" as UC23
}

V --> UC1
V --> UC2
V --> UC3
V --> UC4
V --> UC5
V --> UC6

U --> UC1
U --> UC2
U --> UC3
U --> UC6
U --> UC7
U --> UC8
U --> UC9
U --> UC10
U --> UC11
U --> UC12
U --> UC13
U --> UC14
U --> UC15
U --> UC16

A --> UC17
A --> UC18
A --> UC19
A --> UC20
A --> UC21
A --> UC22
A --> UC23
A --> UC1
A --> UC2
A --> UC3
A --> UC7
@enduml
```

### Option B — Draw.io (diagrams.net)

1. Open https://app.diagrams.net/ (or https://www.draw.io/)
2. Create a new diagram and choose **UML** or blank.
3. From the left shape library, add **UML** → **Use case** (actor stick figure, oval use cases, rectangle system boundary).
4. Draw:
   - **Actors:** Visitor, User, Admin (outside the system rectangle).
   - **System boundary:** one rectangle labeled “PetsCape”.
   - **Use case ovals** inside the boundary (see list below).
   - **Associations:** lines between actors and use cases they can perform.

### Use cases to include (for Draw.io or any tool)

| Actor   | Use case |
|---------|----------|
| Visitor | Browse animals, View animal details, View lost/found reports, View stats, Take quiz, Register, Login |
| User    | All visitor use cases + View profile, Submit adoption request, Book appointment, Submit lost/found report, Mark report as resolved, View my adoptions, View my appointments, View my reports, View notifications, Donate |
| Admin   | All user use cases + Manage animals (CRUD), Manage species, Approve/Reject adoptions, Confirm/Cancel appointments, Manage users (ban), View donations, View audit logs |

---

## 3. Quick reference — Mermaid class diagram only

If you only need the **class diagram** and want to render it quickly:

- **Mermaid Live:** https://mermaid.live → paste the Mermaid code from section 1 → export PNG/SVG.

No account required; the diagram is generated in the browser.
