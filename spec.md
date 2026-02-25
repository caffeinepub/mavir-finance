# Specification

## Summary
**Goal:** Rebrand the app from "Mavir Finance" to "Mahveer Finance", remove Caffeine footer attribution, and add Login/Register pages with a basic client-side authentication flow.

**Planned changes:**
- Replace all occurrences of "Mavir Finance" with "Mahveer Finance" across the UI (HTML title, header logo, footer, landing page, headings, metadata)
- Remove the Caffeine.ai attribution line from the Footer component
- Create a Login page at `/login` with email, password, "Remember Me" checkbox, and Login button (navy/gold theme)
- Create a Registration page at `/register` with Full Name, Email, Phone Number, Password, Confirm Password inputs, and Register button (navy/gold theme)
- Add "Login" and "Register" navigation links to the Header (desktop nav and mobile menu)
- Register `/login` and `/register` routes in the router within the shared Header/Footer layout
- Implement client-side auth using localStorage: registration saves credentials and redirects to `/login`; login validates credentials, sets auth flag, and redirects to `/admin`; "Remember Me" persists session across browser restarts
- Protect the `/admin` route, redirecting unauthenticated users to `/login`
- Add a logout action in the Admin Dashboard that clears the auth flag and redirects to `/login`

**User-visible outcome:** Users can register and log in via dedicated pages, are redirected to the Admin Dashboard on successful login, and the entire app displays the updated "Mahveer Finance" branding with no Caffeine attribution in the footer.
