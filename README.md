
# IMPOSTER Admin Dashboard

Welcome to the IMPOSTER Admin Dashboard! This is a web application built to help you manage poster printing orders. It connects directly to your Google Sheet to read and update data, and it can talk to your n8n automations.

Here is a simple, logical breakdown of how everything works.

---

## 1. Business & Automations Overview

**IMPOSTER** is a custom poster printing business offering A3 and A4 posters. Customers place orders via a Google Form, choosing designs from the IMPOSTER Catalog or uploading their own custom images.

To make this business highly scalable, the entire pipeline is automated using **n8n**. The Next.js dashboard acts as the control center to monitor and trigger these automated processes.

There are two major n8n workflows powering the business:

### Automation 1: Order Intake & Preparation
When a customer submits the Google Form, this workflow automatically triggers to process the raw data:
- **Pricing Engine:** Dynamically calculates the exact total price (handling single prints vs. 5-packs for both A3 and A4 sizes).
- **Validation:** Normalizes the data, verifies quantities against uploaded files, and cross-references requested catalog numbers with the expanded master Catalog database (now supporting 120+ designs).
- **Order ID Generation:** Creates a unique, production-safe Order ID (e.g., `IMP-260828-154313-ABCDEF`).
- **Google Drive Generation:** Automatically creates a structured Google Drive folder hierarchy (`Order ID - Customer Name` > `INPUT`, `CATALOG`, `FINAL` > `A3`, `A4`).
- **File Routing:** Copies the customer's uploaded files and the chosen IMPOSTER Catalog files directly into their respective folders, ready for the print team.
- **Database Entry:** Finally, it writes the clean, processed order into the `orders` Google Sheet (which immediately appears on this Next.js Dashboard).
- <img width="2048" height="1123" alt="image" src="https://github.com/user-attachments/assets/587f9117-1130-484e-b72e-62d46990a455" />


### Automation 2: Fulfillment & Dispatch (Optimized)
When the print team finishes finalizing the designs, they change the "Design Status" on this Next.js Dashboard to **"READY"**. That single click triggers this workflow:
- **Folder Sharing:** Instead of slowly downloading and zipping large image files, n8n instantly locates the existing `FINAL` folder in Google Drive and updates its permissions to generate a public viewer link.
- **WhatsApp Generation:** Generates a personalized WhatsApp message containing the customer's details, dynamic payment instructions (Cash vs. Online), and the direct folder link so the customer can verify their high-quality prints.
- **Dashboard Update:** Updates the Next.js Dashboard with the generated WhatsApp link and marks the status as "READY TO SEND", allowing admins to dispatch the message with a single click.

---
<img width="2048" height="1128" alt="image" src="https://github.com/user-attachments/assets/eefd0e10-f76e-45ac-aa15-4bf0b98b94eb" />


## 1. The Tech Stack (What it's built with)

- **Frontend (The UI)**: Built using **Next.js** (a framework for React). It uses **Tailwind CSS** for styling (making it look good) and **shadcn/ui** for pre-built, nice-looking buttons, dropdowns, and tables.
- **Backend (The Database)**: Instead of a traditional database, this app uses your **Google Sheet**.
- **Automations**: It connects to **n8n** to trigger workflows when specific actions happen.

---

## 2. How the Connections Work

This app acts as the "middleman" between you, your Google Sheet, and your n8n automations. Here are the two main connections:

### Connection A: Dashboard ↔ Google Sheet
To read and write data to your Google Sheet without you needing to log in every time, we use a **Google Service Account**.
Think of a Service Account as a "robot user."
1. You created a robot user (`imposter-dashboard@...`).
2. We gave this robot user a "password" (the Private Key inside `.env.local`).
3. You shared your Google Sheet with the robot user's email address and gave it "Editor" access.
4. **How it works**: Every time you load the dashboard, the Next.js app asks the robot user to go read the Google Sheet and bring back the rows. When you click a dropdown to change a status (like changing Payment from PENDING to PAID), the app tells the robot user to go edit that exact cell in the Google Sheet.

### Connection B: Dashboard → n8n (Google Sheets Trigger)
Because your n8n workflow uses a **Google Sheets Trigger** node, the dashboard doesn't even need to talk to n8n directly!
1. In n8n, you set your trigger to watch the `orders` sheet for a `Row Updated` event, specifically watching the `Design Status` column.
2. **How it works**: When you change the "Design Status" to "READY" on the dashboard, the Next.js app immediately updates that specific cell in the Google Sheet.
3. n8n is constantly watching your Google Sheet. As soon as it sees that cell change to "READY", the n8n workflow wakes up and runs your automation automatically!

---

## 3. The Code Structure (Where things are)

If you ever need to change things, here is a simple guide to where the code lives:

- **`.env.local`**: The secret configuration file. It holds your Service Account email, private key, and Google Sheet ID. (Never share this file online).
- **`lib/googleSheets.ts`**: The file that tells the "robot user" how to talk to Google Sheets. It has the logic for reading the rows and updating cells.
- **`lib/types.ts`**: This file maps the columns in your Google Sheet to the code. If you ever add a new column to your sheet (like "Delivery Address"), you would add it here so the code knows about it.
- **`app/actions/orders.ts`**: The "actions" file. This is where the logic lives that handles fetching orders and securely sending updates to Google Sheets.
- **`components/columns.tsx`**: The code that designs the table columns. This is where we define what the Badges look like, what options are in the dropdowns, and where the WhatsApp button links to.
- **`components/orders-dashboard.tsx`**: The main layout of the page (the stats cards at the top, the search bar, the tabs).

---

## 4. Running the Project

To run the dashboard locally on your computer:

1. Open your terminal in this folder (`n8n`).
2. Make sure you have installed everything by running:
   ```bash
   npm install
   ```
3. Start the development server by running:
   ```bash
   npm run dev
   ```
4. Open your browser and go to `http://localhost:3000`.

---
<img width="2048" height="1153" alt="image" src="https://github.com/user-attachments/assets/4b6e53c7-1c2c-41de-9a0d-321016695e5b" />


## Frequently Asked Questions

**Will changing something in my n8n server break this dashboard?**
NO. The dashboard is completely decoupled from n8n. The dashboard only talks to Google Sheets.
- If you change the steps *inside* your n8n workflow (e.g., you change the message template it sends), the dashboard will not break.
- Because they don't talk directly, you can pause, edit, or even delete your n8n workflow, and the dashboard will continue working perfectly (it will just keep updating Google Sheets like normal).

**What happens if I change the Google Sheet columns?**
If you rearrange the columns, rename the headers, or add new columns in the middle of your sheet, the dashboard might get confused because it reads data based on the exact column locations defined in `lib/types.ts`. If you modify your sheet structure heavily, you will need to update the `COLUMN_MAP` in `lib/types.ts` to match the new layout.



the workflows are---
IMPOSTER — Order Intake
IMPOSTER — Fulfillment & Dispatch

