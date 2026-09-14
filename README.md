# 🌍 CityPasses Project

Welcome to the **CityPasses** project! 'Localforlocal' project evolved
into the 'Gemeentepassen' project. This README provides all the
necessary instructions to set up and run the application on your local
machine.

The repository for the 'LocalforLocal' project is here:
https://github.com/CentricEU/local4local.

The project is founded by the EU NGI Program.

The project is composed of:

-   **Frontend:** Angular (municipality, supplier and citizen apps ---
    `frontend/`)
-   **Backend:** Spring Boot (`backend/`)
-   **Database:** PostgreSQL (with PostGIS)
-   **Mobile App:** React Native, pure, not Expo (`mobile/`)
-   **Test Automation:** Playwright --- API test suite
    (`automation_api/`), UI test suite (`automation_fe/`), and the
    original e2e suite (`automation/`)

The project is licensed under the **GNU Affero General Public License
v3.0 (AGPL-3.0)** --- see [LICENSE](LICENSE).

------------------------------------------------------------------------

## 🆕 What's New

The latest patch bundles two releases (see [CHANGELOG.md](CHANGELOG.md)
for details):

**Release 1.4 --- Super Admin for Supplier:** Super Administrator role
for supplier management, Admin Edit mode for supplier requests before
approval, status column on Pending Requests (Pending / Rejected /
Incomplete), supplier History tab in both web applications, supplier
email notifications on admin edits, and full change tracking & audit
logging (Javers).

**Release 1.3 --- Inclusive Access & Offer Management:**
municipality-assisted flows for non-digital passholders with voucher
printing, BSN/passholder-number filtering on the Passholders overview,
supplier offer editing/suspension/detail pages with multi-benefit
assignment, a simplified restriction model (Frequency of Use, Time
Slots), and updated code validation and citizen mobile flows for the
revised offer types.

The patch also adds Swagger/OpenAPI documentation, two Playwright test
suites (`automation_api`, `automation_fe`), the AGPL-3.0 license, and
the accompanying Flyway migrations.

------------------------------------------------------------------------

## 🚀 Prerequisites

Before starting, ensure you have the following installed on your
machine:

### Required Software

-   **PgAdmin + PostgreSQL Server 18** ([Download
    PostgreSQL](https://www.postgresql.org/download/))
-   **PostGIS 3.6.x** --- install through **Stack Builder** after
    PostgreSQL is installed
-   **Java - JDK 25** ([Download
    JDK](https://www.oracle.com/java/technologies/javase-downloads.html))
-   **Node.js 22.19.0** ([Download Node.js](https://nodejs.org/))
-   **npm 10.9.x** (included with the Node.js installation used for this
    project)
-   **Python 3.13.7** ([Download
    Python](https://www.python.org/downloads/))
-   **Maven 3.9.11** ([Download
    Maven](https://maven.apache.org/download.cgi))
-   **Visual Studio Build Tools 2022** with the **Desktop development
    with C++** workload (Windows; required when `canvas@2.11.2` must be
    compiled locally)
-   **GTK2 x64 bundle** extracted to `C:\\GTK` (Windows; required by
    `canvas@2.11.2` source compilation)
-   **AWS CLI** ([Install AWS
    CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html))

After installation, verify the main toolchain:

``` powershell
java -version
node -v
npm -v
python --version
mvn -version
```

The local setup documented here was verified with **Java 25**, **Node.js
22.19.0**, **npm 10.9.3**, **Python 3.13.7**, **Angular 20.3.16 / CLI
20.3.16**, and **Nx 21**.

### Optional Software

-   **IntelliJ IDEA**

-   **VSCode**

-   **Git** ([Download Git](https://git-scm.com/downloads))

-   **Android Studio** (for Android mobile development)

-   **Xcode** (for iOS mobile development, macOS only)

-   **CocoaPods** (for iOS dependencies)

    ``` bash
    sudo gem install cocoapods
    ```

------------------------------------------------------------------------

## 🛠️ Project Setup

### 1️⃣ Database Setup

1.  Install **PostgreSQL Server 18** and **pgAdmin**.

2.  Open **Stack Builder**, select the PostgreSQL 18 installation, and
    install **PostGIS 3.6.x** from **Spatial Extensions**.

3.  Create a PostgreSQL login for local development if it does not
    already exist:

    ``` sql
    CREATE USER admin WITH PASSWORD 'password';
    ```

4.  Create a new database named `local4local` with `admin` as owner:

    ``` sql
    CREATE DATABASE local4local
        WITH OWNER = admin
        ENCODING = 'UTF8';
    ```

5.  Connect to the new `local4local` database and enable PostGIS:

    ``` sql
    CREATE EXTENSION IF NOT EXISTS postgis;
    SELECT PostGIS_Version();
    ```

6.  Run the Backend once to execute the Flyway migrations.

7.  Create the first user and assign its role using the seed script:
    [`backend/local4local/src/main/resources/db/seed/insert_first_user.sql`](backend/local4local/src/main/resources/db/seed/insert_first_user.sql)
    --- replace the email and `tenant_id` placeholders (tenant ids are
    in `l4l_security.tenants`). The default password is `Password1!`;
    generate a different bcrypt hash at https://bcrypt-generator.com if
    needed.

------------------------------------------------------------------------

### 2️⃣ Backend Setup (Spring Boot)

1.  Open the `backend` folder in **IDE** ( **IntelliJ** or **Eclipse**
    preferred).
2.  Update the database connection in `application.properties` if
    needed:

``` properties
spring.datasource.url=jdbc:postgresql://localhost:5432/local4local
spring.datasource.username=admin
spring.datasource.password=password
```

3.  Install all dependencies:

``` bash
mvn install
```

4.  Configure AWS access. The backend uses AWS for:

    -   **SES v2** (region `eu-central-1`) --- sending emails
    -   **S3** (region `eu-west-2`) --- QR codes
        (`aws.s3.bucketName.qrCodes`) and file storage
        (`cloud.aws.s3.bucketName`)
    -   **Secrets Manager** (region `eu-west-2`) --- externalized
        secrets for hosted environments

    Provide credentials via the `aws.access_key` and `aws.secret_key`
    properties (e.g. in a local, non-committed profile), or configure
    the AWS CLI:

``` bash
aws configure
```

5.  Choose a Spring profile. Configuration lives in
    `src/main/resources`:

      --------------------------------------------------------------------------
      File                                   Purpose
      -------------------------------------- -----------------------------------
      `application.properties`               Base configuration (defaults to
                                             profile `local`)

      `application-development.properties`   Development environment overrides

      `application-acceptance.properties`    Acceptance environment overrides

      `application-production.properties`    Production environment overrides
      --------------------------------------------------------------------------

    Set the active profile with `spring.profiles.active` or
    `-Dspring-boot.run.profiles=<profile>`. Key settings: datasource
    (`spring.datasource.*`), JWT expiry (`jwt.*`), frontend URLs
    (`local4local.*.server.name`), file upload limits, and the AWS
    properties above. **Never commit real credentials.**

6.  Run the project.\

7.  The backend service will be running at <http://localhost:8080>
    (context path `/api`, Swagger UI at `/api/swagger-ui/index.html`).

------------------------------------------------------------------------

### 3️⃣ Frontend Setup (Angular)

1.  Open the `frontend` folder in **IDE** ( **VSCode** or any other
    IDE).
2.  The frontend currently uses **Angular 20.3.16** (Angular CLI
    **20.3.16**) with **Nx 21**. Install the matching Angular CLI
    globally if needed:

``` bash
npm install -g @angular/cli@20.3.16
```

3.  **Windows only:** install the native C++ build toolchain required by
    `canvas@2.11.2` when no prebuilt binary is available:

``` powershell
winget install Microsoft.VisualStudio.2022.BuildTools
```

Then open **Visual Studio Installer** → **Build Tools 2022** →
**Modify** and enable **Desktop development with C++**. Keep at least
**MSVC v143**, **Windows 11 SDK**, and **C++ CMake tools for Windows**
selected.

You can verify the C++ toolchain with:

``` powershell
& "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe" -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64
```

4.  **Windows only / `canvas@2.11.2`:** if npm reports missing files
    such as `C:\GTK\bin\libcairo-2.dll` or `cairo.h`, download the
    **GTK2 x64 bundle** and extract its contents directly to `C:\GTK`.
    The resulting layout must contain:

``` text
C:\GTK\bin
C:\GTK\include
C:\GTK\lib
```

For example, verify that `C:\GTK\bin\libcairo-2.dll` and
`C:\GTK\include\cairo\cairo.h` exist.

5.  Install project dependencies:

``` bash
npm install --legacy-peer-deps
```

6.  Run the project:

``` bash
npm run start-municipality
```

-   Frontend: <http://localhost:4200>

``` bash
npm run start-supplier
```

-   Frontend: <http://localhost:4201>

``` bash
npm run start-passholder
```

-   Frontend: <http://localhost:4202>

``` bash
npm run start-citizen
```

-   Frontend: <http://localhost:4203>

------------------------------------------------------------------------

### 4️⃣ Mobile App Setup (React Native)

The mobile app is built using **React Native CLI** (pure React Native,
not Expo).

#### ⚠️ Platform Requirements

-   **Android:** Windows or macOS
-   **iOS:** macOS only (Xcode required)

#### Install Dependencies

``` bash
npm install
```

-   For iOS, install CocoaPods dependencies:

``` bash
cd ios
pod install
cd ..
```

#### Running on Android (Windows/macOS)

1.  Open **Android Studio** and ensure the following are installed:
    -   Android SDK
    -   Android SDK Platform Tools
    -   Emulator (AVD)\
2.  Start an emulator via **AVD Manager** or connect a physical Android
    device via USB (enable developer mode).\
3.  Run the app:

``` bash
npx react-native run-android
```

#### Running on iOS (macOS Only)

1.  Open the `ios` folder in **Xcode** and select your target device or
    simulator.\
2.  Ensure a **Development Team** is selected to sign the app.\
3.  Run the app:

``` bash
npx react-native run-ios
```

#### Notes

-   Ensure the **backend API** is running at <http://localhost:8080>.
    -   For real devices, use your computer's LAN IP instead of
        `localhost`.\
-   On Android, the emulator can use `10.0.2.2` as the localhost
    address.

------------------------------------------------------------------------

### 5️⃣ Configure API Backend for Mobile

In `api.tsx`, configure the API endpoint depending on the environment:

``` ts
// Hosted backend (acceptance)
const API_BASE_URL = "https://api.acceptance.gemeentepassen.eu/api";

// Local development (replace with your computer's LAN IP)
const API_BASE_URL = "http://your_ip_address:8080/api";
```

-   **Hosted backend:** Use this for testing against the live API.\
-   **Local backend:** Use this for local development; ensure the device
    can reach your computer's IP.

------------------------------------------------------------------------

### 6️⃣ Test Automation (Playwright)

The repository contains three Playwright-based test suites:

  ---------------------------------------------------------------------------------------------
  Suite                   Location                            Scope
  ----------------------- ----------------------------------- ---------------------------------
  API tests               `automation_api/l4lApiAutomation`   Backend REST API tests per
                                                              controller, with DB validation
                                                              queries and test data sets

  UI tests                `automation_fe`                     UI tests with page objects for
                                                              the municipality and supplier
                                                              portals

  Legacy e2e              `automation`                        Original UI/API e2e project (see
                                                              its own
                                                              [README](automation/README.md))
  ---------------------------------------------------------------------------------------------

#### Setup

1.  Navigate to the suite folder (`automation_api/l4lApiAutomation` or
    `automation_fe`) and install dependencies:

``` bash
npm install
npx playwright install
```

2.  Create an environment file. Each suite loads `.env.<ENV>` from its
    own folder (`ENV` defaults to `development` for the API suite and
    `uidevelopment` for the UI suite). Copy the committed `.env.example`
    in each suite folder to `.env.<ENV>` and fill in the values
    (database access, test accounts, entity IDs). Never commit filled-in
    `.env.*` files.

#### Running tests

``` bash
npx playwright test          # headless
npx playwright test --ui     # UI mode
npx playwright show-report   # view the HTML report
```

------------------------------------------------------------------------

## 🐳 Docker

Dockerfiles are provided for containerized builds:

  ---------------------------------------------------------------------------------
  File                                          Purpose
  --------------------------------------------- -----------------------------------
  `backend/local4local/Dockerfile`              Backend production image

  `backend/local4local/Dockerfile.acceptance`   Backend acceptance image

  `backend/local4local/Dockerfile.dev`          Backend development image

  `backend/local4local/Dockerfile.tests`        Backend test-run image

  `frontend/Dockerfile.dev`                     Frontend development image

  `automation/Dockerfile`                       Legacy e2e suite image
  ---------------------------------------------------------------------------------

Example (backend):

``` bash
cd backend/local4local
docker build -f Dockerfile.dev -t citypasses-backend:dev .
docker run -p 8080:8080 citypasses-backend:dev
```

> ⚠️ There is no `docker-compose.yml` yet; database and AWS
> configuration must be provided via environment/profiles.

------------------------------------------------------------------------

## 🔁 CI/CD

`azure-pipelines.yml` builds the Nx/Angular frontend apps and runs their
unit tests on pushes to `development` (Node 20). Backend (Maven) and
Playwright suites are not yet part of the pipeline.

------------------------------------------------------------------------

## 🧾 Versioning & Project Documentation

-   Releases follow semantic versioning and are documented in
    [CHANGELOG.md](CHANGELOG.md); releases are tagged in git (`vX.Y.Z`).
-   Contribution guidelines: [CONTRIBUTING.md](CONTRIBUTING.md)
-   Security policy / vulnerability reporting:
    [SECURITY.md](SECURITY.md)

------------------------------------------------------------------------

## 🌐 Running the Application

1.  Ensure both the **backend** and **frontend** servers are running.
2.  Open your browser and navigate to the corresponding frontend URL.\
3.  For mobile, ensure the app points to the correct API endpoint
    (`api.tsx`).

------------------------------------------------------------------------

## 🐞 Troubleshooting

### Backend Issues

-   **Database Connection Error:** Ensure PostgreSQL is running and
    credentials in `application.properties` are correct.
-   **Port Conflicts:** Verify that port `8080` is free or update it in
    `application.properties`.

### Frontend Issues

-   **Dependency Errors:** Use Node.js `22.19.0` and run
    `npm install --legacy-peer-deps`.
-   **`canvas@2.11.2` / `node-pre-gyp` errors:** Node 22 may not have a
    prebuilt `canvas@2.11.2` binary for the required ABI, so npm falls
    back to a local native build. On Windows, ensure **Visual Studio
    Build Tools 2022 + Desktop development with C++** and the **GTK2 x64
    bundle in `C:\GTK`** are installed.
-   **`Cannot open include file: 'cairo.h'`:** verify
    `C:\GTK\include\cairo\cairo.h` and the GTK DLLs under `C:\GTK\bin`.
-   **`ERR_SSL_SSL/TLS_ALERT_HANDSHAKE_FAILURE`:** check corporate
    proxy/VPN/CA configuration and npm registry settings before
    disabling SSL validation.
-   **`EPERM` cleanup warnings:** these may occur when Windows has files
    under `node_modules` open. If the install still finishes with
    `added ... packages`, the warning itself is not fatal.
-   **Port Conflicts:** Verify that ports `4200–4203` are free or update
    the Angular CLI configuration.

### Mobile Issues

-   **Android Emulator Not Starting:** Verify Android Studio setup and
    AVD configuration.
-   **iOS Build Errors:** Ensure Xcode is updated and a Development Team
    is selected.
-   **API Connection Issues:** Check `api.tsx` for correct backend URL
    and network accessibility.

------------------------------------------------------------------------

## 📄 License

This project is licensed under the **GNU Affero General Public License
v3.0 (AGPL-3.0)**. See the [LICENSE](LICENSE) file for the full text.

------------------------------------------------------------------------

## 📋 Repository Classification & Evidence Level

**Classification:** Published with limitations **Evidence Level:** 2

The repository is classified as **published with limitations** and
assigned **Evidence Level 2**. The source code and an explicit
open-source licence (AGPL-3.0) are publicly available, and the project
includes meaningful build, dependency and testing information.

------------------------------------------------------------------------

### 🌟 Thank you for using CityPasses!
