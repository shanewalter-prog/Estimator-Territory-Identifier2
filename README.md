# Territory Lookup API for Go High Level

This API accepts an address and returns which of your 4 territories (A, B, C, or D) it falls into. Perfect for routing leads to the right calendar in Go High Level.

## Your Territories

| Territory | Description |
|-----------|-------------|
| A | Northern portion of Northern Territory (Fort Collins area) |
| B | Southern portion of Northern Territory (Loveland/Longmont area) |
| C | Northern portion of Southern Territory (Boulder/Westminster area) |
| D | Southern portion of Southern Territory (Denver metro area) |

---

## Setup Instructions

### Step 1: Get a Google Maps API Key (Free Tier)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use an existing one)
3. Go to **APIs & Services** → **Library**
4. Search for **"Geocoding API"** and enable it
5. Go to **APIs & Services** → **Credentials**
6. Click **Create Credentials** → **API Key**
7. Copy your API key
8. (Recommended) Click on the API key to restrict it:
   - Under "API restrictions", select "Restrict key"
   - Choose only "Geocoding API"

**Note:** Google gives you $200/month free credit, which covers ~40,000 geocoding requests.

---

### Step 2: Deploy to Vercel (Free)

#### Option A: One-Click Deploy (Easiest)

1. Create a [GitHub account](https://github.com) if you don't have one
2. Create a new repository and upload the files from the `territory-api` folder
3. Go to [Vercel](https://vercel.com) and sign up with GitHub
4. Click **"Add New Project"**
5. Import your GitHub repository
6. Before deploying, add your environment variable:
   - Click **"Environment Variables"**
   - Add: `GOOGLE_MAPS_API_KEY` = `your-api-key-here`
7. Click **Deploy**

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to the project folder
cd territory-api

# Deploy (follow the prompts)
vercel

# Add your API key
vercel env add GOOGLE_MAPS_API_KEY
# Paste your Google Maps API key when prompted
# Select all environments (Production, Preview, Development)

# Redeploy to apply the environment variable
vercel --prod
```

---

### Step 3: Test Your API

Once deployed, Vercel will give you a URL like: `https://territory-api-xxxx.vercel.app`

Test it in your browser:

```
https://your-project.vercel.app/api/lookup?address=1600 Amphitheatre Parkway, Mountain View, CA
```

Or test with addresses in your service area:

```
https://your-project.vercel.app/api/lookup?address=123 Main St, Fort Collins, CO
https://your-project.vercel.app/api/lookup?address=456 Pearl St, Boulder, CO
https://your-project.vercel.app/api/lookup?address=789 16th St, Denver, CO
```

---

## API Reference

### Endpoint

```
GET /api/lookup?address={address}
```

or

```
POST /api/lookup
Content-Type: application/json

{
  "address": "123 Main St, Denver, CO 80202"
}
```

### Success Response

```json
{
  "error": false,
  "input_address": "123 Main St, Denver, CO 80202",
  "formatted_address": "123 Main St, Denver, CO 80202, USA",
  "coordinates": {
    "latitude": 39.7392,
    "longitude": -104.9903
  },
  "territory": "D",
  "territory_found": true,
  "territory_description": "Southern portion of Southern Territory"
}
```

### Outside Service Area Response

```json
{
  "error": false,
  "input_address": "123 Main St, Los Angeles, CA",
  "formatted_address": "123 Main St, Los Angeles, CA 90012, USA",
  "coordinates": {
    "latitude": 34.0522,
    "longitude": -118.2437
  },
  "territory": null,
  "territory_found": false,
  "territory_description": "Address is outside all service territories"
}
```

---

## Go High Level Integration

### Setting Up the Webhook in GHL

1. In your GHL workflow, add a **"Webhook"** action
2. Set the method to **GET**
3. Set the URL to:
   ```
   https://your-project.vercel.app/api/lookup?address={{contact.address1}} {{contact.city}} {{contact.state}} {{contact.postal_code}}
   ```
4. The response will include `territory` which you can use in conditions

### Using the Response in GHL

After the webhook action, add a **"If/Else"** condition:

```
If webhook.territory equals "A" → Show Calendar A
If webhook.territory equals "B" → Show Calendar B
If webhook.territory equals "C" → Show Calendar C
If webhook.territory equals "D" → Show Calendar D
If webhook.territory_found equals false → Show "Outside Service Area" message
```

---

## Updating Your Territories

If you need to modify your territory boundaries:

1. Go back to [geojson.io](https://geojson.io)
2. Paste your original GeoJSON to see current boundaries
3. Modify the polygons as needed
4. Copy the new coordinates
5. Update the `territories` array in `api/lookup.js`
6. Redeploy: `vercel --prod`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Missing Google Maps API key" | Add `GOOGLE_MAPS_API_KEY` to Vercel environment variables and redeploy |
| "Could not find address" | The address may be incomplete or misspelled |
| Address always returns "outside territory" | Check that your polygon coordinates are correct (longitude first, then latitude) |
| CORS errors | The API already has CORS enabled for all origins |

---

## Cost Estimate

- **Vercel Hosting:** Free tier (100GB bandwidth, plenty for most uses)
- **Google Geocoding:** Free tier covers ~40,000 requests/month
- **Total:** $0/month for typical small business usage

---

## Need Help?

If you need to make changes to the territories or add features, just ask!
