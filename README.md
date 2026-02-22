# Share Your Trip

A lightweight web app for splitting transport and shared expenses among trip participants. Built for Swiss Alpine Club (CAS) outings and similar group trips.

## Features

- **Multi-leg trip planning** — define multiple trip legs with origin/destination and per-km rates
- **Car & passenger management** — assign drivers and passengers per car, with support for 6+ seat vehicles at different rates
- **Expense splitting** — add shared expenses and split them among any subset of participants
- **Role-based exemptions** — trip leaders and deputies are exempt from transport costs
- **Automatic distance lookup** — optional OpenRouteService API integration for geocoding and driving distance
- **Summary & settlements** — computed balance per person with suggested transfer payments
- **Export** — CSV export and print/PDF support
- **Bilingual** — French and English (FR/EN)
- **Offline-capable** — all data stored in the browser via localStorage, no backend required

## Tech Stack

- **Vue 3** (CDN, no build step)
- **Vanilla CSS** (no framework)
- **ES Modules** (no bundler)
- **OpenRouteService API** (optional, for geocoding and routing)

## Project Structure

```
share-your-trip/
├── index.html          # Single-page application
├── css/
│   └── style.css       # All styles
├── js/
│   ├── app.js          # Vue app setup, state management, UI logic
│   ├── calculator.js   # Cost computation and transfer settlements
│   ├── i18n.js         # Translations (FR/EN)
│   ├── routing.js      # OpenRouteService geocoding & distance
│   └── storage.js      # localStorage persistence, CSV export
└── package.json        # Dev dependencies (Playwright for testing)
```

## Getting Started

No build step required. Simply serve the files with any static HTTP server:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx serve .
```

Then open `http://localhost:8000` in your browser.

## Deployment (Apache on Ubuntu)

```bash
sudo apt update && sudo apt install -y apache2

# Copy project files
sudo mkdir -p /var/www/share-your-trip
sudo cp -r index.html css/ js/ /var/www/share-your-trip/

# Create Apache virtual host
sudo tee /etc/apache2/sites-available/share-your-trip.conf > /dev/null <<'VHOST'
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/share-your-trip
    <Directory /var/www/share-your-trip>
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted
        FallbackResource /index.html
    </Directory>
</VirtualHost>
VHOST

# Enable and start
sudo a2ensite share-your-trip
sudo systemctl reload apache2
```

For HTTPS, add Let's Encrypt:

```bash
sudo apt install -y certbot python3-certbot-apache
sudo certbot --apache -d your-domain.com
```

## OpenRouteService API (Optional)

To enable automatic geocoding and distance calculation:

1. Get a free API key at [openrouteservice.org](https://openrouteservice.org)
2. Enter it in the app under **Step 1 > API Key**

Without an API key, distances can be entered manually.

## License

ISC
