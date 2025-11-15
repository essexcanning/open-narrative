# Narrative Sentinel

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Tech Stack](https://img.shields.io/badge/Tech-React%20%7C%20Gemini%20%7C%20TypeScript-brightgreen)
![Status](https://img.shields.io/badge/Status-Hackathon%20Build-orange)

An AI-powered defensive tool for monitoring and countering information operations by detecting trending narratives, assessing their risks using the DMMI & DISARM frameworks, and suggesting ethical countermeasures.

---

## Overview

Narrative Sentinel is a mission-critical dashboard designed for information integrity analysts, researchers, and platform trust & safety teams. In an increasingly complex information environment, this tool provides the necessary clarity and operational speed to identify and mitigate the impact of harmful narratives like disinformation and foreign interference.

The application moves beyond simple content moderation by focusing on the **tactics, techniques, and procedures (TTPs)** behind information operations, providing a strategic, framework-driven approach to defense.



---

## Core Features

*   **Real-Time Data Ingestion:** Leverages the **Gemini API with Google Search grounding** to fetch up-to-the-minute data from news articles, web pages, and social media platforms (X/Twitter via proxy).
*   **AI-Powered Narrative Clustering:** Uses `gemini-2.5-flash` to rapidly analyze hundreds of ingested posts, automatically identifying and clustering them into distinct, coherent narratives.
*   **Deep Analysis with DMMI & DISARM:** Each narrative is enriched by `gemini-2.5-pro`, which performs a sophisticated, multi-layered analysis:
    *   **DMMI Framework:** Classifies the narrative as Disinformation, Misinformation, Malinformation, or Information, assessing its intent and veracity.
    *   **DISARM Framework:** Identifies the adversary's TTPs by mapping them to the DISARM Red (attack) framework, detailing the phase, tactics, and techniques used.
*   **Actionable Countermeasures:** The AI generates ethical, defensive counter-opportunities based on the **DISARM Blue (defense) framework**, providing specific tactics and rationales to mitigate the threat.
*   **Operational Workflows:**
    *   **Signal Alliance Briefing:** Instantly generates a structured, concise mission brief for trusted external partners, complete with an overview, key messages, and objectives.
    *   **Digital Action Taskforce:** Creates an internal assignment brief for platform integrity teams, outlining the threat, suspected policy violations, and required actions.
*   **Intuitive Dashboard:** A clean, responsive interface for visualizing narratives, risk scores, trends, and detailed analytical reports. Includes sorting, filtering, and a dedicated taskforce tracking page.

---

## Tech Stack

*   **Frontend:** React, TypeScript, Tailwind CSS
*   **AI & Backend Logic:** Google Gemini API
    *   `gemini-2.5-flash`: For high-speed tasks like narrative clustering and brief generation.
    *   `gemini-2.5-pro`: For complex, in-depth analysis and framework application.
*   **Real-time Data:** Gemini API with Google Search grounding.
*   **Twitter Integration:** A secure backend proxy is required to handle Twitter API v2 calls safely. An example implementation is provided in `/services/twitterService.ts`.

---

## Ethical Use Mandate

This tool is designed and intended **exclusively for defensive purposes**. Its use is governed by a strict ethical mandate:

1.  **Defensive Use Only:** Never use this tool for offensive manipulation, censorship, or suppressing legitimate speech. Its purpose is to protect, not to attack.
2.  **Transparency and Proportionality:** All countermeasures must be transparent, proportionate, and aligned with democratic principles and human rights.
3.  **Protect Privacy:** The focus of analysis must be on coordinated inauthentic behavior and harmful narratives, not the personal data or beliefs of individuals.

---

## Getting Started

This project uses an `index.html` file with an `importmap` for modern ES module resolution, making it simple to run without a complex build setup.

### Prerequisites

*   A modern web browser (Chrome, Firefox, Safari, Edge).
*   A Google Gemini API Key.

### Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/narrative-sentinel.git
    cd narrative-sentinel
    ```

2.  **Set up your API Key:**
    The application expects the Gemini API key to be available as `process.env.API_KEY`. The easiest way to run this locally in a development environment that supports this (like the one this project was built in) is to create a `.env` file in the root of the project:
    ```
    API_KEY=your_gemini_api_key_here
    ```

3.  **Run the application:**
    Serve the project root directory using a simple local web server. For example, using Python:
    ```bash
    python3 -m http.server
    ```
    Or using Node.js with `http-server`:
    ```bash
    npx http-server .
    ```
    Then open your browser to `http://localhost:8000` (or the port specified by your server).

4.  **(Optional) Set up Twitter Integration:**
    For the "X / Twitter" data source to function, you must deploy the backend proxy function described in the comments of `src/services/twitterService.ts`. This requires a Twitter Developer account and a serverless function provider (e.g., Vercel, Netlify, Google Cloud Functions).

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
