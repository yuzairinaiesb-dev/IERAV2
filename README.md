# IERAV2 Posture Guardian MVP

Mobile-first MVP for AI-assisted Initial Ergonomic Risk Assessment (IERA) posture screening.

## Features

- Choose photo from phone gallery
- Take new camera photo
- Real AI pose landmark detection using MediaPipe Tasks Vision
- Skeleton overlay for head/neck, backbone, hands/arms, and legs
- IERA checklist mapping and scoring
- Advanced ERA recommendation
- PDF report generation

## Netlify deployment

Build command:

```bash
npm run build
```

Publish directory:

```bash
dist
```

## Notes

This MVP loads the MediaPipe pose model in the browser. Internet access is required for the AI model to load.

This tool supports initial ergonomic screening only. Results should be verified by a competent assessor before workplace decisions are made.
