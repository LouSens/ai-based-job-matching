# Verification Demo Behavior

This document describes the current mock verification flow used by KerjaCerdas for the identity and education checks shown in the frontend dashboard.

These checks are demo-only. They do not call real Dukcapil, PSrE, or SIVIL services.

## Summary

KerjaCerdas exposes two verification endpoints:

- `POST /api/v1/verify/identity`
- `POST /api/v1/verify/education`

The frontend calls these endpoints from the verification dashboard and updates the UI based on the returned status.

## Identity Verification

### Request Flow

The frontend submits:

- `nik`
- `full_name`
- `date_of_birth`

The backend route is `POST /api/v1/verify/identity`.

### Demo Logic

The identity verification uses rule-based logic in the mock `MockIdentityVerificationService`:

- verification passes only if the NIK length is exactly 16 characters
- verification fails if the NIK starts with `99`
- no real Dukcapil lookup is performed
- no real biometric or selfie verification is performed

### Returned Fields

On success, the API returns:

- `status = "VERIFIED"`
- `match_percentage = 98.5`
- `message = "Identitas berhasil diverifikasi pada mode demo."`
- `verification_hash`
- `pii_redacted = true`

On failure, the API returns:

- `status = "FAILED"`
- `match_percentage = 45.2`
- `message = "Verifikasi identitas gagal pada mode demo."`
- `verification_hash`
- `pii_redacted = true`

### Verification Hash

The `verification_hash` is a deterministic SHA-256 hash of:

```text
nik:full_name
```

This is only a mock verification artifact for the demo. It does not prove real-world identity verification.

### Important Limitations

- `date_of_birth` is accepted by the API but is not used in the verification decision
- `selfie_image_base64` exists in the backend request model but is not used
- the frontend displays a biometric match score of `98.5%` after success, which matches the fixed mock API score

### Demo Test Cases

Use these examples when demoing the feature:

- pass: any 16-digit NIK that does not start with `99`
- fail: any NIK that starts with `99`
- fail: any NIK that is not 16 digits long

## Education Verification

### Request Flow

The frontend submits:

- `ijazah_number`
- `university_name`
- `major`

The backend route is `POST /api/v1/verify/education`.

### Demo Logic

The education verification uses a simple hardcoded rule:

- verification passes if `ijazah_number` is non-empty and not equal to `"0000"`
- verification fails if `ijazah_number` is empty
- verification fails if `ijazah_number == "0000"`

No real SIVIL or Dikti lookup is performed.

### Returned Fields

On success, the API returns:

- `status = "VERIFIED"`
- `message = "Ijazah terdaftar resmi di SIVIL (Kemdikbudristek)."`
- `verified_data` with:
  - `university`
  - `major`
  - `graduation_year = "2023"`
  - `degree = "S1"`
  - `status = "Lulus"`

On failure, the API returns:

- `status = "NOT_FOUND"`
- `message = "Nomor Ijazah tidak ditemukan di database SIVIL."`
- `verified_data = null`

### Demo Test Cases

Use these examples when demoing the feature:

- pass: any non-empty ijazah number except `0000`
- fail: `0000`
- fail: empty ijazah number

## Frontend Behavior

The verification dashboard handles both forms with three main states:

- `loading`
- `verified`
- `failed`

Identity-specific UI behavior:

- submit is disabled until the NIK is 16 digits long
- the input strips non-digit characters
- after success, the UI masks the NIK and shows the returned `verification_hash`
- after failure, the UI hints that test NIKs starting with `99` will fail

Education-specific UI behavior:

- submit is disabled until `ijazah_number` is non-empty
- after success, the UI renders the returned `verified_data`

## Source of Truth

Current implementation references:

- `src/api/main.py`
- `src/api/services/identity_verifier.py`
- `src/frontend/src/services/api.js`
- `src/frontend/src/components/VerificationDashboard.jsx`
