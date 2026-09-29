# ResQEarth API Configuration

This file contains the public API endpoints used by ResQEarth for weather, disaster events,
official Indian alerts, earthquake data, and reverse geocoding.

> **Security:** The APIs below are mostly public and do not require an API key. Never commit
> private credentials, tokens, passwords, or `.env` files to GitHub.

## 1. Open-Meteo — Weather + Flood

**Purpose**
- Weather Dashboard
- Risk Engine inputs
- River-discharge/flood data

**API key:** Not required for the public/non-commercial API.

### Weather endpoint

```text
https://api.open-meteo.com/v1/forecast
```

Example:

```text
https://api.open-meteo.com/v1/forecast?latitude=19.0760&longitude=72.8777&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m,wind_gusts_10m&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,precipitation_probability,rain,weather_code,wind_speed_10m,wind_gusts_10m&timezone=auto
```

Useful variables:
- `temperature_2m`
- `apparent_temperature`
- `relative_humidity_2m`
- `precipitation`
- `precipitation_probability`
- `rain`
- `weather_code`
- `wind_speed_10m`
- `wind_gusts_10m`

### Flood API

```text
https://flood-api.open-meteo.com/v1/flood
```

Example:

```text
https://flood-api.open-meteo.com/v1/flood?latitude=19.0760&longitude=72.8777&daily=river_discharge,river_discharge_mean,river_discharge_max,river_discharge_min&forecast_days=7
```

Use `river_discharge` as the main river-flow input for the Risk Engine.

**Important:** Open-Meteo's Flood API uses GloFAS data and has approximately 5 km spatial
resolution, so the nearest river/grid cell may not always represent the exact local river.

Docs:
- https://open-meteo.com/en/docs
- https://open-meteo.com/en/docs/flood-api

---

## 2. USGS Earthquake Feed

**Purpose**
- Live earthquake layer
- MapLibre earthquake markers
- Earthquake information popup

**API key:** Not required.

### Recommended real-time GeoJSON feed

```text
https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson
```

Other useful feeds:

```text
https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson
https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson
https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson
https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_day.geojson
```

Common fields:
- `geometry.coordinates[0]` = longitude
- `geometry.coordinates[1]` = latitude
- `geometry.coordinates[2]` = depth
- `properties.mag` = magnitude
- `properties.place` = location description
- `properties.time` = event timestamp
- `properties.url` = USGS event page
- `properties.detail` = detailed GeoJSON URL

For custom queries:

```text
https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson
```

Docs:
- https://earthquake.usgs.gov/earthquakes/feed/
- https://earthquake.usgs.gov/fdsnws/event/1/

---

## 3. NASA EONET v3

**Purpose**
- Natural-disaster map events
- Wildfires
- Severe storms
- Volcanoes
- Floods
- Other supported natural-event categories

**API key:** Not required for the EONET public API.

### Current/open events — GeoJSON

```text
https://eonet.gsfc.nasa.gov/api/v3/events/geojson?status=open
```

### Recent events

```text
https://eonet.gsfc.nasa.gov/api/v3/events/geojson?days=20
```

### Category filter

```text
https://eonet.gsfc.nasa.gov/api/v3/events/geojson?category=wildfires&status=open
```

### Geographic bounding box

```text
https://eonet.gsfc.nasa.gov/api/v3/events/geojson?bbox=72.7,19.3,73.1,18.9&status=open
```

Bounding-box order:

```text
min longitude, max latitude, max longitude, min latitude
```

### Useful categories

Get the current category list:

```text
https://eonet.gsfc.nasa.gov/api/v3/categories
```

Common categories include:
- `wildfires`
- `severeStorms`
- `volcanoes`
- `floods`

EONET event fields include:
- `id`
- `title`
- `description`
- `link`
- `closed`
- `categories`
- `sources`
- `geometry`

Docs:
- https://eonet.gsfc.nasa.gov/docs/v3

---

## 4. NDMA SACHET — Official Indian Alerts

**Purpose**
- Official India disaster alerts
- Geo-targeted CAP alerts
- Primary source for the **Official Indian Alert** section

**API key:** No API key should be placed in this repository.

SACHET publishes India CAP alerts through its RSS feed system.

Official portal:

```text
https://sachet.ndma.gov.in/
```

CAP/RSS page:

```text
https://sachet.ndma.gov.in/CapFeed
```

**Important implementation rule:**

Display official alerts separately from the application's own calculated risk:

```text
Source: NDMA SACHET / relevant authorised agency
```

Do **not** label the application's calculated Risk Score as an NDMA warning.

If the RSS User Guide gives a specific feed URL required by the implementation, use that documented
URL rather than guessing an endpoint.

---

## 5. IMD — India Meteorological Department

**Purpose**
- Official Indian weather data
- City forecast
- Current weather
- District nowcast
- District rainfall
- District warnings
- State rainfall
- River-basin QPF

**API key / account:** IMD provides an official API Management Platform. Use registration/credentials
only if the selected IMD API requires them.

Official API portal:

```text
https://api.imd.gov.in/public/index.php
```

### Documented API endpoints

7-day city forecast:

```text
https://city.imd.gov.in/api/cityweather.php?id=42182
```

7-day city forecast by latitude/longitude:

```text
https://city.imd.gov.in/api/cityweather_loc.php
```

Current weather:

```text
https://mausam.imd.gov.in/api/current_wx_api.php?id=42182
```

District nowcast:

```text
https://mausam.imd.gov.in/api/nowcast_district_api.php?id=5
```

District rainfall:

```text
https://mausam.imd.gov.in/api/districtwise_rainfall_api.php
```

District warnings:

```text
https://mausam.imd.gov.in/api/warnings_district_api.php?id=1
```

Station nowcast:

```text
https://mausam.imd.gov.in/api/nowcastapi.php?id=Jaipur%20AP
```

State rainfall:

```text
https://mausam.imd.gov.in/api/statewise_rainfall_api.php
```

District nowcast RSS:

```text
https://mausam.imd.gov.in/imd_latest/contents/dist_nowcast_rss.php
```

AWS/ARG data:

```text
https://city.imd.gov.in/api/aws_data_api.php
```

River-basin QPF:

```text
https://mausam.imd.gov.in/api/basin_qpf_api.php
```

Port weather/warnings:

```text
https://mausam.imd.gov.in/api/port_wx_api.php
```

**Project strategy:** Use Open-Meteo as the first operational weather source. Add IMD integration
when its API access works; do not block the project on IMD credentials.

Official documentation:
- https://api.imd.gov.in/public/index.php
- https://mausam.imd.gov.in/imd_latest/contents/api.pdf

---

## 6. OpenStreetMap Nominatim — Reverse Geocoding

**Purpose**

Convert:

```text
19.0760, 72.8777
```

into:

```text
Mumbai, Maharashtra, India
```

**API key:** Not required for the public Nominatim service.

Endpoint:

```text
https://nominatim.openstreetmap.org/reverse
```

Example:

```text
https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=19.0760&lon=72.8777&zoom=10&addressdetails=1
```

Required implementation headers:

```text
User-Agent: ResQEarth/1.0 (your-contact-email@example.com)
```

Rules for the public service:
- Maximum 1 request/second
- Identify your application with a valid User-Agent or Referer
- Display OpenStreetMap/Nominatim attribution
- Cache results where practical
- Do not use the public server for heavy/bulk geocoding

For the demo, reverse-geocode only when the selected location changes and cache the result.

Policy:
- https://operations.osmfoundation.org/policies/nominatim/

---

# API Key / Secret Summary

| Service | Key required? | Store in `.env`? |
|---|---:|---:|
| Open-Meteo | No for public/non-commercial use | No |
| Open-Meteo Flood | No for public/non-commercial use | No |
| USGS Earthquake | No | No |
| NASA EONET v3 | No | No |
| NDMA SACHET | Public CAP/RSS service | No secret in repo |
| IMD | Depends on API/access method; use official registration if required | Yes, if credentials are issued |
| OSM Nominatim | No | No |

# Recommended Project Environment File

Create `.env.example`:

```env
# Only fill these if your selected service actually issues/requires credentials.
IMD_API_KEY=

# Do not put secrets in this file.
# Public APIs:
# OPEN_METEO_BASE_URL=https://api.open-meteo.com/v1
# OPEN_METEO_FLOOD_BASE_URL=https://flood-api.open-meteo.com/v1
# USGS_BASE_URL=https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary
# EONET_BASE_URL=https://eonet.gsfc.nasa.gov/api/v3
# SACHET_BASE_URL=https://sachet.ndma.gov.in
# NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org
```

Add this to `.gitignore`:

```gitignore
.env
.env.*
!.env.example
```

# Source Attribution

When displaying data in the application, keep the source visible:

```text
Weather: Open-Meteo
Earthquakes: USGS
Natural Events: NASA EONET
Official Indian Alerts: NDMA SACHET / relevant authorised agency
Indian Weather: IMD
Map/Geocoding: OpenStreetMap / Nominatim
```

## Important Risk Engine Rule

The ResQEarth Risk Engine calculates its **own risk score** from available data.

Never present this calculated score as an official government warning.

Example:

```text
Risk Score: 72/100
Calculated by ResQEarth Risk Engine

Official Alert:
NDMA SACHET / authorised agency
```
