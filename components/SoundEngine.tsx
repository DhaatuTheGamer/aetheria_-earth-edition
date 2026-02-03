
import React, { useEffect, useRef } from 'react';
import { PlanetParameters } from '../types';

interface SoundEngineProps {
  enabled: boolean;
  params: PlanetParameters;
}

export const SoundEngine: React.FC<SoundEngineProps> = ({ enabled, params }) => {
  const contextRef = useRef<AudioContext | null>(null);
  const windNodeRef = useRef<GainNode | null>(null);
  const droneNodeRef = useRef<GainNode | null>(null);
  
  // Initialize Audio Context & Lifecycle Management
  useEffect(() => {
    if (enabled) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      contextRef.current = ctx;

      // WIND (Pink Noise)
      const bufferSize = 4096;
      const pinkNoise = ctx.createScriptProcessor(bufferSize, 1, 1);
      pinkNoise.onaudioprocess = (e) => {
        const output = e.outputBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168981;
          output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          output[i] *= 0.11; // (roughly) compensate for gain
          b6 = white * 0.115926;
        }
      };
      const windGain = ctx.createGain();
      windGain.gain.value = 0.0;
      pinkNoise.connect(windGain);
      windGain.connect(ctx.destination);
      windNodeRef.current = windGain;

      // DRONE (Low Oscillator)
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 60; // 60Hz hum
      const droneGain = ctx.createGain();
      droneGain.gain.value = 0.0;
      osc.connect(droneGain);
      droneGain.connect(ctx.destination);
      osc.start();
      droneNodeRef.current = droneGain;

      console.log("Audio Engine Started");
    }

    // Cleanup function: Closes context when enabled becomes false or component unmounts
    return () => {
      if (contextRef.current) {
        if (contextRef.current.state !== 'closed') {
           try {
             contextRef.current.close();
           } catch (e) {
             console.warn("Error closing AudioContext", e);
           }
        }
        contextRef.current = null;
        windNodeRef.current = null;
        droneNodeRef.current = null;
      }
    };
  }, [enabled]);

  // Update Sounds based on Params
  useEffect(() => {
    // Only update if context is active
    if (!contextRef.current || contextRef.current.state === 'closed') return;

    const ctx = contextRef.current;
    
    // Wind logic: Higher rotation + higher cloud density = louder wind
    if (windNodeRef.current) {
        const windVolume = Math.min(0.3, (params.rotationSpeed * 2) + (params.cloudDensity * 0.1));
        windNodeRef.current.gain.setTargetAtTime(windVolume, ctx.currentTime, 0.5);
    }

    // Drone logic: City intensity = louder hum
    if (droneNodeRef.current) {
        const droneVolume = Math.min(0.15, params.cityLightIntensity * 0.05);
        droneNodeRef.current.gain.setTargetAtTime(droneVolume, ctx.currentTime, 0.5);
    }

  }, [params]); // Intentionally exclude 'enabled' to avoid re-running if params change while disabled

  return null;
};
