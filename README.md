# Foodie React Food Ordering Project

## Features
- Login and sign-up demo
- Food search and category filters
- Add/remove cart quantities
- Delivery address form with phone and PIN validation
- Cash on Delivery, UPI demo, and card demo selection
- Order summary and confirmation screen
- Order history and live delivery tracking with persistent storage (`localStorage`)
- Reorder past orders directly into cart
- Order status filters (All, Active, Delivered, Cancelled) and search
- Responsive layout

## Run in VS Code
1. Extract the ZIP and open the project folder in VS Code.
2. Open Terminal > New Terminal.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open the localhost URL shown in the terminal.

## Important
Authentication uses browser localStorage for learning only and is not production secure. Payment choices are UI demos only. No real payment is processed. For a production app, use a secure backend, password hashing, database, and a payment provider integration. Never collect or store raw card details in this frontend.
