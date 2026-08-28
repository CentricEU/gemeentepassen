# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project intends to adhere to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Note:** Versioning starts with this file. Earlier history is only available as git commits.
> When cutting a release: update this file, tag the commit (`git tag -a vX.Y.Z -m "..."`), and push the tag.
> Release dates below are to be confirmed by the team; both releases were merged in the "Patch 2026" commit.

## [Unreleased]

### Added

- `.env.example` templates for the `automation_api` and `automation_fe` test suites
- `CONTRIBUTING.md`, `SECURITY.md` and this `CHANGELOG.md`
- Seed script for creating the first admin user (`backend/local4local/src/main/resources/db/seed/`)

### Fixed

- `azure-pipelines.yml` updated to Node 20 / Nx build (was a stale Node 16 Angular build)

## [1.4.0] - 2026 — Super Admin for Supplier

*Municipality Web Application & Supplier Web Application*

### Added

- **Super Administrator role** with elevated permissions for supplier management; the first municipality administrator account is assigned it automatically, additional users via User Management
- **Admin Edit mode** — Super Admins can modify supplier data directly before approval (Save and Approve / Discard Changes)
- **Status column** on the Pending Requests table (Pending, Rejected, Incomplete) with role-based action visibility
- **Supplier History tab** — chronological record of status changes and data modifications, available in both the Municipality application and the Supplier Profile page
- **Email notifications** to suppliers when their profile is edited and approved by the municipality, including the list of modified fields
- **Change tracking & audit logging** at database level (Javers): changed fields, previous/new values, and acting user
- Swagger/OpenAPI documentation for the backend API
- Playwright API test suite (`automation_api`) and UI test suite (`automation_fe`)
- AGPL-3.0 license file

### Notes

- No breaking changes; existing administrator accounts retain their permissions. The Super Administrator role must be explicitly assigned through User Management.

## [1.3.0] - 2026 — Inclusive Access & Offer Management

*Municipality Web Application, Supplier Web Application & Citizen Mobile Application (Android & iOS)*

### Added

- **Support for non-digital passholders** — municipality-assisted flows for citizens without the mobile app, including viewing available offers on the Passholder page and **voucher printing** of offer codes
- **Passholders overview filtering** by BSN and Passholder number
- **Supplier offer management** — edit existing offers (subject to municipality approval; limited fields once transactions exist), suspend active offers, dedicated offer detail page, and multi-benefit assignment (a distinct offer entry per benefit)
- **Simplified offer restriction model** — two restriction types: Frequency of Use and Time Slots

### Changed

- **Code validation flow** updated to align with the revised offer type model (Membership Fee, Credit Store, Admission, Product, BOGO)
- **Citizen mobile flows** updated for the new offer types with correct credit deduction
- Platform-wide stabilisation of the offer type model across all three applications

## Pre-1.3.0

The project evolved from the [Local4Local](https://github.com/CentricEU/local4local) repository
into the Gemeentepassen / CityPasses project. See git history for details.
