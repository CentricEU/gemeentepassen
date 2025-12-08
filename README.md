# 🌍 CityPasses Project

Welcome to the **CityPasses** project! This README provides all the necessary instructions to set up and run the application on your local machine. 

The project is composed of:

- **Frontend:** Angular
- **Backend:** Spring Boot
- **Database:** PostgreSQL
- **Mobile App:** React Native (pure, not Expo)

---

## 🚀 Prerequisites

Before starting, ensure you have the following installed on your machine:

### Required Software

- **PgAdmin + PostgreSQL Server** ([Download PostgreSQL](https://www.postgresql.org/download/))
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

1. Create a new database named `l4l`.
2. Install PostGIS Spatial Extension and PostgreSQL Server.
3.Run Backend to execute migrations. 
3. Insert the first user (replace your email and tenant ID). Password is `'Password1!'`:

```sql
INSERT INTO l4l_security."user"(
    username, password, is_active, tenant_id, supplier_id, is_approved, first_name, last_name, is_enabled)
VALUES ( 'your_email@example.com', 
         '$2y$12$CFBzxx0/9JT5/x.x9/40gOIgJKCwMrfaWdSA4OxvtgkXrGrazWgqu', 
         true, 'tenant_id', null, true, 'First Name', 'Last Name', true);
```

For password generator you can use: https://bcrypt-generator.com.

4. Insert a role for the user (replace `user_id` with the ID of the newly created user):

```sql
INSERT INTO l4l_security.user_role(
    user_id, role_id)
VALUES ( 'user_id', 0);
```

---

### 2️⃣ Backend Setup (Spring Boot)

1. Open the `backend` folder in **IDE** ( **IntelliJ** or **Eclipse** preferred).
2. Update the database connection in `application.properties` if needed:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/l4l
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
npm i -g @19
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

### Backend Issues

- **Database Connection Error:** Ensure PostgreSQL is running and credentials in `application.properties` are correct.
- **Port Conflicts:** Verify that port `8080` is free or update it in `application.properties`.

### Frontend Issues

- **Dependency Errors:** Run `npm install` to ensure all dependencies are installed.
- **Port Conflicts:** Verify that ports `4200/4201/4202` are free or update the Angular CLI configuration.

### Mobile Issues

- **Android Emulator Not Starting:** Verify Android Studio setup and AVD configuration.
- **iOS Build Errors:** Ensure Xcode is updated and a Development Team is selected.
- **API Connection Issues:** Check `api.tsx` for correct backend URL and network accessibility.

---

### 🌟 Thank you for using CityPasses!

