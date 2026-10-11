<div align="center">

<img src="docs/images/banner.svg" alt="IMPOSTER — campus poster printing, fully automated" width="100%"/>

<br/>

![n8n](https://img.shields.io/badge/automation-n8n-EA4B71?style=for-the-badge&logo=n8n&logoColor=white)
![Next.js](https://img.shields.io/badge/dashboard-Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Google Sheets](https://img.shields.io/badge/database-Google%20Sheets-34A853?style=for-the-badge&logo=googlesheets&logoColor=white)
![Google Drive](https://img.shields.io/badge/files-Google%20Drive-4285F4?style=for-the-badge&logo=googledrive&logoColor=white)
![Tailwind](https://img.shields.io/badge/ui-Tailwind%20CSS-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Upscayl](https://img.shields.io/badge/AI%20upscaling-Real--ESRGAN-8B5CF6?style=for-the-badge)

### A real poster business, run by a Google Form, a handful of n8n workflows and a very honest admin dashboard.

*Customer orders → automation validates, prices & prepares → AI upscales every image → you review → one click and it's print-ready.*

</div>

---

## ✨ The story in 60 seconds

IMPOSTER is a custom poster printing business in a college hostel. It started with a **Google Form** — free, instant, zero setup — because there was no point building a website before knowing anyone would order.

People did order. And then the same chores ate every evening: check the form, price it, review the designs, pull files from Drive, rename, sort A3 from A4, **upscale every image by hand**, build a folder, type a WhatsApp message… ten orders in, that's a headache with a name.

So instead of building the website first, the **automation behind the form** got built — and a web dashboard was added on top of it afterwards. Every workflow here exists because something was *actually breaking* the business.

> **Customer → Automation → Team → Automation → Customer**

---

## 🗺️ How an order travels

```mermaid
flowchart TD
    C(["🧑‍🎓 Customer<br/>fills the Google Form"]) --> S1[("📄 Form Responses<br/>sheet")]

    subgraph A1["⚙️ Workflow 1 · Order Intake v2"]
      direction LR
      N["Normalize the messy form answer"] --> P["Price it<br/>(A3 / A4, 1 or 5-pack)"]
      P --> V{"Quantities, designs &<br/>catalog numbers valid?"}
      V -- yes --> F["Create Drive folders<br/>Order › FINAL › A3 / A4"]
      V -- no --> H["Write row as<br/>ON HOLD · NEEDS FIXING<br/>+ the reason"]
    end

    S1 --> N
    F --> W[("📊 orders sheet")]
    H --> W

    subgraph A2["🪄 Workflow 2 · Auto Upscale"]
      direction LR
      D["Download each image"] --> U["Upscayl · Real-ESRGAN<br/>300 DPI (or 400 DPI HQ mode)"]
      U --> R["Replace the old file<br/>in FINAL / A3 · A4"]
    end

    F --> D
    R --> AR["🔎 AWAITING REVIEW"]

    AR --> T(["👩‍💻 You check the images<br/>and click READY"])

    subgraph A3["📦 Workflow 3 · Fulfillment & Dispatch v2"]
      direction LR
      M["Copy to MASTER A3 / A4<br/>(the print folders)"] --> L["Share the folder<br/>+ build the WhatsApp message"]
    end

    T --> M
    L --> Z(["💬 One tap on Send<br/>customer gets the message"])

    classDef good fill:#d1fae5,stroke:#10b981,color:#064e3b;
    classDef bad fill:#fee2e2,stroke:#ef4444,color:#7f1d1d;
    classDef you fill:#ede9fe,stroke:#8b5cf6,color:#3b0764;
    class F,R,L,M good;
    class H bad;
    class T,Z you;
```

The only manual steps left in the whole business are the two that need a human eye: **checking the finished images** and **clicking READY**.

---

## 🖥️ The admin dashboard

A Next.js dashboard that sits on top of the same Google Sheet. It reads orders, shows what needs attention, lets you change statuses, and fires the dispatch workflow with a single click.

<div align="center">

**Orders table** — dark theme

<img src="docs/images/orders-dark.png" alt="Orders table, dark theme" width="100%"/>

<br/><br/>

<table>
<tr>
<td width="50%" align="center"><b>Dashboard · light</b><br/><img src="docs/images/dashboard-light.png" alt="Dashboard light theme"/></td>
<td width="50%" align="center"><b>Dashboard · dark</b><br/><img src="docs/images/dashboard-dark.png" alt="Dashboard dark theme"/></td>
</tr>
<tr>
<td colspan="2" align="center"><b>Orders table · light</b><br/><img src="docs/images/orders-light.png" alt="Orders table light theme"/></td>
</tr>
</table>

<sub>🔒 Screenshots use fictional sample data (<code>DEMO_MODE</code>) — no real customers are shown.</sub>

</div>

**Highlights**

- 📊 Live stat cards: total orders, action required, revenue, profit, A3 / A4 prints.
- 🎨 Colour-coded status badges for every stage of the pipeline.
- 🛡️ **Safety guard:** the `READY` option is **disabled while an order is still queued or upscaling**, so a wrong click can never print the old low-quality file.
- 🔎 Tabs (All / Action Required / Completed) and search by order ID or name.
- 💬 A green **Send** button appears the moment the WhatsApp message is ready; **Files** jumps straight to the order's Drive folder.
- 🧪 **Demo mode** — run the whole UI on made-up orders, no Google credentials required (see [Quick start](#-quick-start)).

---

## 🔁 The life of an order (status lifecycle)

```mermaid
stateDiagram-v2
    direction LR
    [*] --> UPSCALING: valid order
    [*] --> ON_HOLD: needs fixing
    ON_HOLD: ON HOLD
    ON_HOLD --> [*]: contact the customer
    UPSCALING --> AWAITING_REVIEW: images upscaled
    UPSCALING --> UPSCALE_ISSUE: an image failed
    UPSCALE_ISSUE: UPSCALE ISSUE
    AWAITING_REVIEW: AWAITING REVIEW
    UPSCALE_ISSUE --> AWAITING_REVIEW: fixed manually
    AWAITING_REVIEW --> READY: you click READY
    READY --> [*]: copied to print folders + WhatsApp link built
```

| Status | Meaning | What you do |
|---|---|---|
| `UPSCALING` | Images are being upscaled | Nothing, wait |
| `QUEUED HQ` / `UPSCALING HQ` | Waiting for / running the maximum-quality re-upscale | Wait — **don't** set READY |
| `AWAITING REVIEW` | Everything upscaled and sitting in `FINAL/A3` / `FINAL/A4` | Look at the images, then click **READY** |
| `UPSCALE ISSUE` | One image failed (the reason is in *Notes*) | Ask for a new upload or fix it by hand |
| `ON HOLD` / `NEEDS FIXING` | The form answer didn't add up (reason in *Notes*) | Message the customer |
| `READY` | You approved it | Dispatch runs automatically |

---

## 💸 Pricing

| Size | 1 poster | 5 posters |
|---|:---:|:---:|
| **A3** (297 × 420 mm) | **₹60** | **₹250** |
| **A4** (210 × 297 mm) | **₹40** | **₹170** |

Prices are calculated in two places that always agree: the **Calculate Price** node of *Order Intake v2* (new orders) and the **Generate WhatsApp Link** node of *Fulfillment & Dispatch v2* (re-calculated from the quantities, shown as the order total and written back to the sheet). Packs are applied automatically: `packs × pack price + remainder × single price`. The dashboard has **no hard-coded selling prices** — it just reads *A3 Price / A4 Price / Total Price* from the sheet.

---

## 🧩 The three workflows

> Files live in [`workflows-v2/`](workflows-v2). Import them into n8n and connect your Google credentials.

### 1 · Order Intake v2
Triggered by every new Google Form row.

- 🧹 **Normalizes** the raw form (the form has several differently-named columns for the same thing — A3-only, A4-only and "both" sections).
- 💰 **Prices** the order.
- ✅ **Validates**: quantity must equal the number of designs; every catalog number must exist and be active; numbers typed as `21 101 166`, `21,101,166` or even a number Google Sheets mangled are all understood.
- 🗂️ Creates only the folders that matter: `Order › FINAL › A3 / A4`.
- 🚧 Bad orders are **still recorded** — as `ON HOLD · NEEDS FIXING` with the reason in *Notes* — but nothing else runs for them.
- 🪄 Hands every good order to the upscaler.

### 2 · Auto Upscale
The step that used to be done by hand, image by image.

| | Normal mode | Maximum-quality (HQ) mode |
|---|---|---|
| Model | Real-ESRGAN `high-fidelity-4x` (Upscayl) | same |
| Target | **300 DPI** — A3 `3508 × 4961`, A4 `2480 × 3508` | **400 DPI** — A3 `4677 × 6614`, A4 `3307 × 4677` |
| Extra | — | **TTA** (8-pass) for small sources (< 2 MP) |
| Already ≥ 300 DPI? | copied untouched | copied untouched |
| Tiny image? | second AI pass until the target is reached | same |

Smart details:

- 🚫 **Never crops or distorts.** If a photo isn't A-series shaped, the order's *Notes* get a *"check crop"* warning instead.
- ♻️ **Idempotent.** Re-running an image replaces the old file (the old one goes to Drive's trash), so nothing is printed twice.
- 🧵 **One GPU job at a time** (a lock in the script), so a busy night doesn't melt the laptop.
- 📝 Writes a summary to *Notes*: how many images were upscaled, kept as-is, failed, or need a crop check.
- Runs on the machine that hosts n8n, using [Upscayl](https://upscayl.org)'s bundled engine — **free, offline, no API costs**.

### 3 · Fulfillment & Dispatch v2
Triggered when *Design Status* becomes `READY` (and only then — it ignores every other edit, and never runs twice for the same order).

- 📂 Copies the finished files into `MASTER A3` / `MASTER A4`, prefixed with the customer's name.
- 🔗 Shares the order's `FINAL` folder so the customer can preview their exact prints.
- 💬 Builds the personalised WhatsApp message and a click-to-send link, then writes the link and the recalculated prices back to the sheet.

The message the customer receives:

> Hi *Name*! Your IMPOSTER order is received and we are verifying your payment screenshot.
>
> Please check this folder link to verify your chosen designs … *(folder link)*
>
> Your order:
> A3 x 5 = ₹250
> A4 x 2 = ₹80
> Total: ₹330
>
> Please check your designs in the folder above. If everything is correct and the quality looks good, just reply *Everything fine* and we will start printing. If you want to put a higher quality image, reply here with your new file and we will replace it before printing.
>
> We will process your print and deliver it to your hostel soon!

(Cash customers get the same text with a note that payment is collected in advance.)

---

## 🐛 Real bugs we hit (and what they taught us)

None of this was built to look good on GitHub — a lot broke along the way, and every bug said something true about the business underneath.

| Bug | What was really going on |
|---|---|
| 🔢 `104,126,134,168,169` became **104126134168169** | Google Sheets saw a list that *looks* like a number with thousands separators and silently converted it. The parser now splits such values back into design numbers. |
| 🔁 Orders silently stopped for weeks | The Google login stored in n8n expired (an OAuth app in *Testing* mode expires tokens about weekly). Lesson: publish the OAuth consent screen, and watch the executions page. |
| 🧮 Only the *first* image of each order was upscaled | n8n's *Execute Command* node runs once per batch, no matter how many items come in. The command now handles a whole order in one go. |
| 🎯 A4-only orders created phantom A3 files | One generic upload column was being read for both sizes. |
| ♻️ Editing any cell re-fired the dispatch | The trigger watched a column but never checked it equalled `READY`. |
| 📚 Catalog stopped at design 120 | The index, the form parser and the sheet disagreed on the range; designs 121–179 now live in Drive and the sheet. |
| 🖱️ Clicking READY too early printed old files | The dashboard now blocks `READY` while an order is queued or upscaling. |

---

## 🚀 Quick start

### Run the dashboard in demo mode (no credentials needed)

```bash
npm install
DEMO_MODE=true npm run dev
```

Open <http://localhost:3000>. You get made-up orders in every status; changes are read-only.

### Run it against your own Google Sheet

1. Create a **Google Service Account**, download its key, and **share your sheet with its e-mail address (Editor)**.
2. Create `.env.local`:

   ```bash
   GOOGLE_CLIENT_EMAIL=imposter-dashboard@your-project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_SHEET_ID=your-sheet-id
   GOOGLE_SHEET_NAME=orders        # optional, defaults to "orders"
   ```
3. `npm run dev` → <http://localhost:3000>.

> The dashboard talks **only to Google Sheets**. n8n watches the same sheet, so changing a status in the dashboard is what wakes the workflows up — no direct connection needed, and pausing or editing a workflow never breaks the dashboard.

### Set up the n8n side

1. Install [Upscayl](https://upscayl.org) and run `bash workflows-v2/setup.sh` (installs the upscale script into `~/.n8n-files/imposter/`).
2. Start n8n with the *Execute Command* node enabled (n8n 2.x blocks it by default):

   ```bash
   NODES_EXCLUDE='[]' n8n start
   ```
3. Import the three files from [`workflows-v2/`](workflows-v2), connect your Google credentials, and publish **Auto Upscale → Order Intake → Fulfillment & Dispatch**.
4. Your sheet needs three tabs: `Form Responses 1` (linked to the form), `orders`, and `Catalog` (`Design No · Canva Page · Active · Drive File ID`).

> 💡 Keep the machine awake and plugged in while a big batch upscales — closing the lid pauses everything.

---

## 🗂️ Project structure

```
├── app/                    Next.js app (dashboard + orders pages, server actions)
├── components/             Table columns, status badges, stat cards, theme toggle
├── lib/
│   ├── googleSheets.ts     Reads/updates the sheet (or serves demo data)
│   ├── demoOrders.ts       Fictional sample orders for DEMO_MODE
│   └── types.ts            Sheet column map + status types & safety rules
├── workflows-v2/           The three n8n workflows + the upscale script
│   ├── IMPOSTER — Order Intake v2.json
│   ├── IMPOSTER — Auto Upscale.json
│   ├── IMPOSTER — Fulfillment & Dispatch v2.json
│   ├── imposter-upscale.sh   Upscayl / Real-ESRGAN wrapper
│   └── setup.sh              One-time installer
├── docs/images/            README banner + screenshots
└── IMPOSTER — *.json       First-iteration workflows (kept for history)
```

---

## ❓ FAQ

**Will changing something in n8n break the dashboard?**
No. They are decoupled — the dashboard only reads and writes the Google Sheet.

**What if I rearrange the sheet's columns?**
The dashboard reads columns by position. If you add, remove or reorder columns, update `COLUMN_MAP` in [`lib/types.ts`](lib/types.ts).

**Can a customer change their files after receiving the message?**
The folder link is **view-only** on purpose. They reply on WhatsApp with a new image and you replace it in `FINAL` *and* in `MASTER` (the print copy is made the moment you click READY).

**Is the upscaling really free?**
Yes — Upscayl's Real-ESRGAN engine runs locally on the n8n machine. The trade-off is that the machine must be on; top-quality (HQ) mode takes roughly 10 minutes per small image.

---

## 🛣️ What's next

- [ ] Real WhatsApp sending (Cloud API) instead of a click-to-send link
- [ ] Payment auto-verification
- [ ] A "customer confirmed" status so printing only starts after the customer's *Everything fine*
- [ ] Failure alerts and a daily summary message

---

<div align="center">

Built because the same boring steps kept showing up — and a predictable step shouldn't be done by hand a tenth time. 🖨️

**IMPOSTER** · made with n8n, Next.js and a lot of Drive folders

</div>
