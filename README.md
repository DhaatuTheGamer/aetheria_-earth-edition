# 🌍 Aetheria: Earth Edition

**Aetheria** is a stunning, interactive 3D planetary simulator that runs right in your web browser. It combines the power of modern 3D graphics (**Three.js**) with advanced Artificial Intelligence (**Google Gemini**) to create living, breathing worlds.

Whether you want to explore a realistic Earth, terraform a desolate wasteland, or generate entirely new sci-fi civilizations, Aetheria puts the power of a god in your hands.

---

## ✨ Features

*   **Real-Time 3D Simulation**: High-quality graphics with day/night cycles, dynamic atmosphere, volumetric clouds, and city lights that turn on at night.
*   **AI-Powered Generation**: Uses **Google Gemini** to invent unique planet lore, civilizations, and even generate texture maps for new worlds.
*   **Interactive Controls**:
    *   **Terraforming**: Change the water level, cloud density, temperature (snow cover), and toxicity (murkiness).
    *   **Data Layers**: Switch views to see Thermal maps, Population density, or Vegetation biomass.
    *   **Star System**: Change the sun's color (Yellow, Red Dwarf, Blue Giant).
*   **Game Modes**:
    *   **Evolution**: Fast-forward time by 1000 years to see how civilizations rise or fall.
    *   **Disaster**: Trigger random events like gamma-ray bursts or AI takeovers.
    *   **Challenge**: A terraforming puzzle where you must restore a dead planet to habitability.
*   **Exploration**: Click anywhere on the globe to "send a probe" and get a unique AI-generated report about that specific location.
*   **Audio Experience**: Procedural sound engine that adapts to the planet's conditions (wind speed, industrial hum).

---

## 🛠️ Prerequisites

Before you start, make sure you have the following:

1.  **Node.js**: You need Node.js installed on your computer to run this project.
    *   [Download Node.js here](https://nodejs.org/) (LTS version recommended).
2.  **Google Gemini API Key**: This project uses Google's AI models. You need a free API key.
    *   [Get your API Key here](https://aistudio.google.com/app/apikey).

---

## 🚀 Installation & Setup

Follow these simple steps to get Aetheria running on your machine.

### 1. Open the Project
Open your terminal (Command Prompt, PowerShell, or Terminal) and navigate to the project folder:
```bash
cd path/to/aetheria_-earth-edition
```

### 2. Install Dependencies
Run this command to download all the necessary code libraries:
```bash
npm install
```

### 3. Set Up Your API Key
1.  Create a new file in the root folder named `.env` (or rename `.env.local` if it exists).
2.  Open it with a text editor (like Notepad or VS Code).
3.  Add your API key like this:
    ```env
    GEMINI_API_KEY=your_actual_api_key_here
    ```
4.  Save the file.

### 4. Run the App
Start the development server:
```bash
npm run dev
```
You should see a link in the terminal (usually `http://localhost:5173` or `http://localhost:3000`). Ctrl+Click it or copy-paste it into your browser.

---

## 🎮 How to Use

Once the app is running, you'll see the Earth floating in space. Here's how to control it:

### The Interface
*   **Left Panel (Dashboard)**:
    *   **Tabs**: Switch between `Visual` (Normal), `Thermal` (Heat), `Pop` (City Lights), and `Bio` (Plants) modes.
    *   **Sliders**: Drag these to change the planet's physical properties immediately.
    *   **Buttons**: Trigger `Evolution`, `Disasters`, or start a `Challenge`.
*   **Right Panel (Lore)**: Displays the planet's name, description, and habitability score.
*   **Top Bar**:
    *   **Generate World**: Ask AI to create a brand new random planet.
    *   **Photo Mode**: Hides the UI for taking screenshots.
    *   **Audio**: Toggles the background soundscape.

### Interaction
*   **Rotate**: Click and drag on the background to rotate the camera around the planet.
*   **Scan**: Click anywhere on the planet surface to "Land a Probe." The AI will generate a sci-fi report about that specific coordinate (ocean, city, desert, etc.).
*   **Zoom**: Use your mouse wheel to zoom in and out.

---

## 📂 Project Structure

For developers or curious minds, here is a simplified map of the code:

*   **`index.html`**: The main entry point for the web page.
*   **`src/`** (implied root):
    *   **`App.tsx`**: The main brain of the application. Handles the state (what the planet looks like right now).
    *   **`components/`**:
        *   `PlanetScene.tsx`: The 3D container setup.
        *   `PlanetShader.tsx`: The math that makes the planet look real (clouds, atmosphere, lighting).
        *   `UI.tsx`: The buttons, sliders, and text panels you see on screen.
        *   `SoundEngine.tsx`: Generates the wind and drone sounds.
    *   **`services/`**:
        *   `geminiService.ts`: All the code that talks to Google's AI.
*   **`vite.config.ts`**: Configuration for the build tool (Vite).

---

## ⚠️ Troubleshooting

**"I click Generate and nothing happens / Error in console"**
*   Check your `.env` file. Did you paste your API key correctly?
*   Restart the server (`Ctrl+C` in terminal, then `npm run dev` again) after changing the `.env` file.

**"The planet is black/invisible"**
*   Ensure your browser supports WebGL (most modern browsers do).
*   Check if you have hardware acceleration enabled in your browser settings.

---

Enjoy exploring the cosmos! 🚀