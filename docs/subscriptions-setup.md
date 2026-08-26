# Setting up the subscriptions

Every identifier below is a contract with `src/purchases/purchases.ts`. Typos here do
not fail loudly — they produce a paywall with no products and no error, so copy exactly.

| Thing | Value |
|---|---|
| Bundle ID | `com.dahvio.htlt` |
| Outdoorsman product | `com.dahvio.htlt.outdoorsman.annual` |
| Family product | `com.dahvio.htlt.family.annual` |
| Outdoorsman entitlement | `outdoorsman` |
| Family entitlement | `family` |
| Offering | `default` |

---

## 1. App Store Connect

### One subscription group, not two

Subscriptions in the same group are mutually exclusive, and Apple handles upgrades,
downgrades and proration between them for free. Two groups would let someone buy both at
once. Outdoorsman and Family are tiers of the same thing, so they share a group.

**Group reference name:** `Membership` (internal only)
**Group display name:** `Hunting Tags & License Tracker` — this is user-visible in the
subscription management screen.

### The two products

Both are **Auto-Renewable Subscriptions**, duration **1 year**.

| | Outdoorsman | Family |
|---|---|---|
| Product ID | `com.dahvio.htlt.outdoorsman.annual` | `com.dahvio.htlt.family.annual` |
| Reference name | Outdoorsman Annual | Family Annual |
| Price | $19.99 | $34.99 |
| Display name | Outdoorsman | Family |
| Description | Unlimited tags, draws and export | Everything, for up to six people |
| Group level | **2** | **1** |

Level 1 is the *highest* service tier, so Family is level 1. Get this backwards and Apple
treats a move to Family as a downgrade — it would take effect at renewal instead of
immediately, and the user would be annoyed and right.

### Free trial

On **each** product: Introductory Offer → Free Trial → **7 days** → new subscribers.

Worth knowing: Apple grants one introductory offer per *subscription group*, not per
product. Someone who trials Outdoorsman and later moves to Family does not get a second
trial. That is fine and expected — just do not describe it as "free trial on both" in
marketing, because a customer will read that as two.

### Also required before review

- A **review screenshot** for each product. Apple rejects submissions without one. Use
  the paywall screen with that tier's packages visible.
- **Review notes** are worth filling in: say that subscriptions unlock capacity limits
  and that the app is fully usable free, so the reviewer does not go looking for a
  hard paywall that does not exist.
- Paid Applications Agreement must be active, and banking and tax must be complete, or
  products stay stuck in "Missing Metadata" and never load in the app.

---

## 2. RevenueCat

### Project and app

Create the project, add an **App Store** app, bundle ID `com.dahvio.htlt`.

Give it an **In-App Purchase Key** (a `.p8` from App Store Connect → Users and Access →
Integrations → In-App Purchase). RevenueCat needs it to verify transactions with the App
Store Server API. The older App-Specific Shared Secret also works, but the key is the
current path.

Note that `.p8` is already in this repo's `.gitignore` — keep it there.

### Entitlements

Create two, with these exact identifiers:

- `outdoorsman`
- `family`

### Products

Add both product IDs exactly as they appear in App Store Connect.

### Attaching products to entitlements

- `com.dahvio.htlt.outdoorsman.annual` → **`outdoorsman`**
- `com.dahvio.htlt.family.annual` → **`family`** *and* **`outdoorsman`**

Attaching Family to both is deliberate. `tierFrom()` checks `family` first so the tier
resolves correctly either way, and today every gate except `canAddPerson` only asks
whether the tier is not free. But if a future gate ever checks the Outdoorsman
entitlement specifically, a Family subscriber must not fail it.

### Offering

One offering, identifier **`default`**, marked as current. Two packages:

| Package identifier | Product |
|---|---|
| `outdoorsman_annual` | `com.dahvio.htlt.outdoorsman.annual` |
| `family_annual` | `com.dahvio.htlt.family.annual` |

Custom package identifiers are fine — the paywall reads `offering.availablePackages` and
decides what to show from the product ID, not the package name.

---

## 3. The app

Create `.env` in the project root:

```
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxxxxxxxxxxxxxxxxxxxxxxx
```

Use the **public** SDK key from RevenueCat → API keys, the one starting `appl_`. Never
the secret key — that one can issue refunds and must never ship in an app.

`.env` is gitignored. `EXPO_PUBLIC_` variables are read at bundle time, so restart Metro
after creating it. No native rebuild is needed.

### The same key has to exist on EAS

**`.env` covers your machine only.** It is gitignored, so it is not uploaded to EAS Build.
A cloud build inlines `undefined`, `configurePurchases()` returns early, and the app ships
working but unable to sell anything — the paywall reads "Subscriptions are not configured
in this build yet". This is what the first TestFlight release did.

Set it once per environment:

```
eas env:set --name EXPO_PUBLIC_REVENUECAT_IOS_KEY --value appl_… --environment production --visibility plaintext
eas env:set --name EXPO_PUBLIC_REVENUECAT_IOS_KEY --value appl_… --environment preview --visibility plaintext
eas env:set --name EXPO_PUBLIC_REVENUECAT_IOS_KEY --value appl_… --environment development --visibility plaintext
```

`plaintext` is correct, not `secret`. The RevenueCat *public* SDK key is extractable from
any shipped IPA by design; marking it secret hides it from build logs without making it
any less public, and secret variables are harder to verify. The one that must never be
set here is the secret API key.

Confirm before rebuilding:

```
eas env:list --environment production
```

`eas env:pull --environment production` writes them into a local `.env.local` if you want
to reproduce a cloud build's configuration on your machine.

---

## 4. Testing before it is live

Products do not need to be approved to test them, but they do need to exist and be in
at least "Ready to Submit".

1. Create a **Sandbox Apple Account** in App Store Connect → Users and Access → Sandbox.
2. On the device, sign into it under Settings → Developer → Sandbox Apple Account. Do not
   sign out of your real account to do this.
3. Launch the app, hit any gate — add a fourth licence, or open Add Draw.
4. The paywall should list the qualifying package with a real price from the store. If it
   says "Subscriptions are not configured in this build yet", the key is missing. If it
   says "not available right now", the key works but the offering did not load — usually
   products not attached to the offering, or still in Missing Metadata.
5. Buy it. Settings → Subscription should read Outdoorsman or Family.

Sandbox renewals are accelerated — a year becomes an hour — so you can watch a renewal
and an expiry the same afternoon.

---

## What is deliberately not here

Lifetime tiers. See `pricing.md` for why, and for what shape they would take if added.
