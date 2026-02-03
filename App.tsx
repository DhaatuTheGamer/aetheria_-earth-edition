
import React, { useState, useEffect, useCallback } from 'react';
import { PlanetScene } from './components/PlanetScene';
import { UI } from './components/UI';
import { SoundEngine } from './components/SoundEngine';
import { generatePlanetData, generatePOIReport, generatePlanetTexture, evolveCivilization, triggerDisaster, generateChallenge } from './services/geminiService';
import { SimulationState, PlanetParameters, POIData } from './types';
import * as THREE from 'three';

// Real Earth Data Initial State
const initialState: SimulationState = {
  isLoading: false,
  loadingMessage: "",
  photoMode: false,
  isProbeLanding: false,
  selectedPOI: null,
  audioEnabled: false,
  challenge: {
    active: false,
    description: "",
    targetStats: {},
    success: false
  },
  lore: {
    name: "Earth (Terra)",
    description: "The third planet from the Sun. A water-rich world currently hosting a Type 0.7 civilization.",
    age: "4.54 Billion Years",
    civilizationType: "Type 0.73 (Planetary)",
    atmosphereComposition: ["Nitrogen", "Oxygen"],
    population: "8.1 Billion",
    habitabilityScore: 100
  },
  params: {
    seed: 1, 
    waterColor: "#1a468c",
    landColor: "#2d5a27",
    atmosphereColor: "#3b82f6",
    rotationSpeed: 0.05,
    tilt: 0.41,
    cloudDensity: 0.6,
    snowLevel: 0.0,
    waterMurkiness: 0.0,
    sunType: 'yellow',
    dataLayer: 'visual',
    showSatellites: true,
    cityLightColor: "#ffaa33",
    cityLightIntensity: 1.0,
    textureMapUrl: undefined, // Default Earth
    cloudMapUrl: undefined
  }
};

const App: React.FC = () => {
  const [simulation, setSimulation] = useState<SimulationState>(initialState);

  // Check Challenge Success
  useEffect(() => {
    if (simulation.challenge.active && !simulation.challenge.success) {
      let success = true;
      const { targetStats } = simulation.challenge;
      const { params, lore } = simulation;

      if (targetStats.cloudDensity !== undefined) {
        if (Math.abs(params.cloudDensity - targetStats.cloudDensity) > 0.15) success = false;
      }
      if (targetStats.habitabilityScore !== undefined) {
        // Since hab score is static in lore until re-gen, we cheat a bit for gameplay:
        // We assume fixing the visuals implicitly improves habitability for the user feedback loop
        // Or we could trigger a mini-regen. For now, let's base it on parameter matching.
        // Simplified: If cloud density matches target, we assume success for this demo
      }

      if (success && targetStats.cloudDensity !== undefined) {
         setSimulation(prev => ({ ...prev, challenge: { ...prev.challenge, success: true } }));
      }
    }
  }, [simulation.params, simulation.challenge]);

  const handleGenerate = useCallback(async () => {
    setSimulation(prev => ({ ...prev, isLoading: true, loadingMessage: "Analyzing Sector..." }));
    
    try {
      // 1. Generate Data
      const data = await generatePlanetData();
      
      setSimulation(prev => ({
        ...prev,
        loadingMessage: "Synthesizing Surface Texture...",
        lore: data.lore,
        params: { ...prev.params, ...data.params } // Update textual params first
      }));

      // 2. Generate Texture (Parallel or Sequential)
      // Note: We use the description to guide the texture gen
      const textureUrl = await generatePlanetTexture(data.lore.description + " " + data.lore.atmosphereComposition.join(", "));
      
      setSimulation(prev => ({
        ...prev,
        params: { 
            ...prev.params, 
            ...data.params,
            textureMapUrl: textureUrl || undefined,
            cloudMapUrl: undefined // Reset clouds to default or procedural for now
        },
        isLoading: false,
        challenge: { ...prev.challenge, active: false } // Reset challenge
      }));

    } catch (e) {
      console.error(e);
      setSimulation(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const handleEvolve = async () => {
    setSimulation(prev => ({ ...prev, isLoading: true, loadingMessage: "Simulating 1000 Years..." }));
    const result = await evolveCivilization(simulation.lore, 1000);
    setSimulation(prev => ({
        ...prev,
        isLoading: false,
        lore: { ...prev.lore, ...result.loreUpdate },
        params: { ...prev.params, ...result.paramsUpdate }
    }));
  };

  const handleDisaster = async () => {
    setSimulation(prev => ({ ...prev, isLoading: true, loadingMessage: "WARNING: EVENT DETECTED" }));
    const result = await triggerDisaster(simulation.lore);
    setSimulation(prev => ({
        ...prev,
        isLoading: false,
        lore: { ...prev.lore, ...result.loreUpdate },
        params: { ...prev.params, ...result.paramsUpdate }
    }));
  };

  const handleChallenge = async () => {
    setSimulation(prev => ({ ...prev, isLoading: true, loadingMessage: "Calculating Terraforming Metrics..." }));
    const challenge = await generateChallenge();
    setSimulation(prev => ({
        ...prev,
        isLoading: false,
        challenge,
        // Reset planet to "bad" state for challenge
        params: { 
            ...prev.params, 
            cloudDensity: 0.1, 
            waterMurkiness: 0.9, 
            snowLevel: 0.0 
        }
    }));
  };

  const updateParams = (newParams: Partial<PlanetParameters>) => {
      setSimulation(prev => ({
          ...prev,
          params: { ...prev.params, ...newParams }
      }));
  };

  const handlePlanetClick = async (uv: THREE.Vector2) => {
    if (simulation.isLoading || simulation.photoMode) return;
    const report = await generatePOIReport(simulation.lore.description, { x: uv.x, y: uv.y });
    setSimulation(prev => ({ ...prev, selectedPOI: report }));
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white selection:bg-cyan-500/30">
      
      <SoundEngine enabled={simulation.audioEnabled} params={simulation.params} />

      <PlanetScene 
        params={simulation.params} 
        onPlanetClick={handlePlanetClick}
        isProbeLanding={simulation.isProbeLanding}
      />
      
      <UI 
        state={simulation} 
        onGenerate={handleGenerate} 
        updateParams={updateParams}
        toggleProbe={() => setSimulation(prev => ({ ...prev, isProbeLanding: !prev.isProbeLanding }))}
        togglePhoto={() => setSimulation(prev => ({ ...prev, photoMode: !prev.photoMode }))}
        closePOI={() => setSimulation(prev => ({ ...prev, selectedPOI: null }))}
        onEvolve={handleEvolve}
        onDisaster={handleDisaster}
        onChallenge={handleChallenge}
        toggleAudio={() => setSimulation(prev => ({ ...prev, audioEnabled: !prev.audioEnabled }))}
      />
      
      {!simulation.photoMode && (
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[5] bg-[length:100%_2px,3px_100%] opacity-20"></div>
      )}
      
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] z-[4]"></div>
    </div>
  );
};

export default App;
