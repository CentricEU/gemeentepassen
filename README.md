# 🌍 CityPasses Project

This project manages municipal passes and local services. It started as Local4Local and evolved into Gemeentepassen with funding from the EU NGI Program. The original repository is available at https://github.com/CentricEU/local4local.

The project is composed of:

- **Frontend:** Angular
- **Backend:** Spring Boot
- **Database:** PostgreSQL
- **Mobile App:** React Native (pure, not Expo)

---

## 🚀 Prerequisites

Before starting, ensure you have the following installed on your machine:

### Required Software

- **pgAdmin + PostgreSQL Server** ([Download PostgreSQL](https://www.postgresql.org/download/))
- **Java - JDK 17** ([Download JDK](https://www.oracle.com/java/technologies/javase-downloads.html))
- **Node.js 20.19.5** ([Download Node.js](https://nodejs.org/))
- **Python 3.13.7** ([Download Python](https://www.python.org/downloads/))
- **Maven 3.9.11** ([Download Maven](https://maven.apache.org/download.cgi))
- **AWS CLI** ([Install AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html))

### Optional Software

- **IntelliJ IDEA**
- **VSCode**
- **Git** ([Download Git](https://git-scm.com/downloads))
- **Android Studio** (for Android mobile development)
- **Xcode** (for iOS mobile development, macOS only)
- **CocoaPods** (for iOS dependencies)
  ```bash
  sudo gem install cocoapods
  ```

---

## 🛠️ Project Setup

### 1️⃣ Database Setup

1. Install PostgreSQL Server. During installation, leave Stack Builder checked.
2. Install PostGIS Spatial Extenstion from Application Stack Builder.
3. Create a new database named `local4local` in PostgreSQL using pgAdmin.
4. Run Backend to execute migrations.

```bash
mvn install && mvn spring-boot:run
```

5. Choosing a tenant

The application is multi-tenant.
This means every user must belong to exactly one tenant, and users cannot exist without a tenant.

Tenants are stored in the table:
```sql
l4l_security.tenants
```
Each tenant has a unique id(UUID). Before creating the first user, you must choose an existing tenant.

6. Insert the first user

Replace:
- your_email@example.com
- tenant_id → the tenant id copied above

Password is `'Password1!'` (bcrypt hash already provided).

```sql
INSERT INTO l4l_security."user" (
    username,
    password,
    is_active,
    tenant_id,
    supplier_id,
    is_approved,
    first_name,
    last_name,
    is_enabled
)
VALUES (
    'your_email@example.com',
    '$2y$12$CFBzxx0/9JT5/x.x9/40gOIgJKCwMrfaWdSA4OxvtgkXrGrazWgqu',
    true,
    '7b8f9e8c-6e0e-4d1e-b8c0-8c0eaa123456', -- tenant_id
    NULL,
    true,
    'First Name',
    'Last Name',
    true
);
```
💡 If you need a different password, generate a bcrypt hash using: https://bcrypt-generator.com.

7. Get the user ID

After inserting the user, retrieve its ID:
```sql
SELECT id
FROM l4l_security."user"
WHERE username = 'your_email@example.com';
```

8. Assign a role to the user

Role 0 = Admin (adjust if needed).
```sql
INSERT INTO l4l_security.user_role (
    user_id,
    role_id
)
VALUES (
    'user_id_from_previous_step',
    0
);
```

---

### 2️⃣ Backend Setup (Spring Boot)

1. Open the `backend` folder in **IDE** ( **IntelliJ** or **Eclipse** preferred).
2. Update the database connection in `application.properties` if needed:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/local4local
spring.datasource.username=postgres
spring.datasource.password=admin
```

3. Install all dependencies:

```bash
mvn install
```

4. Configure AWS CLI:

```bash
aws configure
```

- Enter your AWS Access Key ID
- Enter your AWS Secret Access Key
- Default region name (e.g., us-east-1)
- Default output format (e.g., json)

5. Run the project.
6. The backend service will be running at [http://localhost:8080](http://localhost:8080).

---

### 3️⃣ Frontend Setup (Angular)

1. Open the `frontend` folder in **IDE** ( **VSCode** or any other IDE).
2. Install Angular CLI 19 globally:

```bash
npm install -g @angular/cli@19
```

3. Install project dependencies:

```bash
npm install --legacy-peer-deps
```

4. Run the project:

```bash
npm run start-municipality
```

- Frontend: [http://localhost:4200](http://localhost:4200)

```bash
npm run start-supplier
```

- Frontend: [http://localhost:4201](http://localhost:4201)

```bash
npm run start-citizen
```

- Frontend: [http://localhost:4202](http://localhost:4202)

---

### 4️⃣ Mobile App Setup (React Native)

The mobile app is built using **React Native CLI** (pure React Native, not Expo).

#### ⚠️ Platform Requirements

- **Android:** Windows or macOS
- **iOS:** macOS only (Xcode required)

#### Install Dependencies

```bash
npm install
```

- For iOS, install CocoaPods dependencies:

```bash
cd ios
pod install
cd ..
```

#### Running on Android (Windows/macOS)

1. Open **Android Studio** and ensure the following are installed:
   - Android SDK
   - Android SDK Platform Tools
   - Emulator (AVD)
2. Start an emulator via **AVD Manager** or connect a physical Android device via USB (enable developer mode).
3. Run the app:

```bash
npx react-native run-android
```

#### Running on iOS (macOS Only)

1. Open the `ios` folder in **Xcode** and select your target device or simulator.
2. Ensure a **Development Team** is selected to sign the app.
3. Run the app:

```bash
npx react-native run-ios
```

#### Notes

- Ensure the **backend API** is running at [http://localhost:8080](http://localhost:8080).
  - For real devices, use your computer’s LAN IP instead of `localhost`.
- On Android, the emulator can use `10.0.2.2` as the localhost address.

---

### 5️⃣ Configure API Backend for Mobile

In `api.tsx`, configure the API endpoint depending on the environment:

```ts
// Hosted backend (acceptance)
const API_BASE_URL = "https://api.acceptance.gemeentepassen.eu/api";

// Local development (replace with your computer's LAN IP)
const API_BASE_URL = "http://your_ip_address:8080/api";
```

- **Hosted backend:** Use this for testing against the live API.
- **Local backend:** Use this for local development; ensure the device can reach your computer’s IP.

---

## 🌐 Running the Application

1. Ensure both the **backend** and **frontend** servers are running.
2. Open your browser and navigate to the corresponding frontend URL.
3. For mobile, ensure the app points to the correct API endpoint (`api.tsx`).

---

## 🐞 Troubleshooting

### Database Connection Issues

**Symptoms:**

- Backend fails to start
- Connection refused errors in logs

**Solutions:**

- Verify PostgreSQL service is running
- Confirm credentials in `application.properties` match your database configuration
- Ensure database name is `local4local` as specified in the connection URL

### Port Conflicts

**Symptoms:**

- Application fails to start
- "Address already in use" errors

**Required Ports:**

- Backend: 8080
- Municipality frontend: 4200
- Supplier frontend: 4201
- Citizen frontend: 4202

**Solutions:**

- Check that required ports are available before starting applications
- Stop conflicting services or modify port configuration in application properties or package.json

### Frontend Dependency Errors

**Symptoms:**

- npm install fails
- Peer dependency warnings

**Solutions:**

- Use the `--legacy-peer-deps` flag during installation
- Verify Node.js version 20.19.5 is installed by running `node --version`

### Mobile Build Failures

**Android Issues:**

- Incomplete Android Studio setup
- Missing SDK or platform tools
- USB debugging not enabled on physical devices

**iOS Issues:**

- Outdated Xcode version
- No development team selected in project settings
- CocoaPods dependencies not installed (check for `Pods` directory in iOS folder)

### Mobile API Connection Problems

**Symptoms:**

- App cannot reach backend
- Network request timeouts

**Solutions:**

- Verify endpoint configuration in `api.tsx`
- Confirm device is on same network as development machine for local testing
- Use `10.0.2.2` for Android emulators or your LAN IP for physical devices
- Check your computer's IP with `ipconfig` (Windows) or `ifconfig` (macOS/Linux)

---

### 🌟 Thank you for using CityPasses!
