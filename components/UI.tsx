
import React from 'react';
import { PlanetLore, SimulationState, DataLayer, PlanetParameters, SunType, POIData } from '../types';

interface UIProps {
  state: SimulationState;
  onGenerate: () => void;
  updateParams: (params: Partial<PlanetParameters>) => void;
  toggleProbe: () => void;
  togglePhoto: () => void;
  closePOI: () => void;
  onEvolve: () => void;
  onDisaster: () => void;
  onChallenge: () => void;
  toggleAudio: () => void;
}

const StatBar: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color = "bg-blue-500" }) => (
  <div className="mb-3">
    <div className="flex justify-between text-xs uppercase tracking-widest text-gray-400 mb-1">
      <span>{label}</span>
      <span className="text-white font-tech">{value}</span>
    </div>
    <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
      <div className={`h-full ${color} opacity-80 shadow-[0_0_10px_rgba(255,255,255,0.5)]`} style={{ width: '100%' }}></div>
    </div>
  </div>
);

const TabButton: React.FC<{ active: boolean; label: string; onClick: () => void }> = ({ active, label, onClick }) => (
    <button 
      onClick={onClick}
      className={`px-3 py-1 text-[10px] uppercase tracking-wider border border-b-0 rounded-t-lg transition-all ${active ? 'bg-cyan-900/50 border-cyan-500 text-cyan-100' : 'bg-transparent border-transparent text-gray-500 hover:text-gray-300'}`}
    >
      {label}
    </button>
);

const Slider: React.FC<{ label: string; value: number; min: number; max: number; onChange: (val: number) => void }> = ({ label, value, min, max, onChange }) => (
    <div className="mb-2">
      <div className="flex justify-between text-[10px] text-gray-400 uppercase mb-1">
        <span>{label}</span>
        <span>{value.toFixed(1)}</span>
      </div>
      <input 
        type="range" min={min} max={max} step={0.1} value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
      />
    </div>
);

export const UI: React.FC<UIProps> = ({ state, onGenerate, updateParams, toggleProbe, togglePhoto, closePOI, onEvolve, onDisaster, onChallenge, toggleAudio }) => {
  const { lore, isLoading, params, photoMode, isProbeLanding, selectedPOI, challenge, loadingMessage, audioEnabled } = state;

  if (photoMode) {
     return (
        <div className="absolute inset-0 pointer-events-auto flex items-end justify-center p-10 z-50">
            <button onClick={togglePhoto} className="px-6 py-2 bg-black/50 backdrop-blur text-white border border-white/20 hover:bg-white/10 uppercase tracking-widest text-sm">
                Exit Photo Mode
            </button>
        </div>
     );
  }

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">
      
      {/* Header */}
      <header className="flex justify-between items-start pointer-events-auto">
        <div>
          <h1 className="text-4xl md:text-6xl font-sci-fi font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">
            AETHERIA
          </h1>
          <p className="text-cyan-200/60 font-tech text-sm tracking-[0.2em] mt-1">PLANETARY SIMULATION ENGINE v1.2</p>
        </div>
        
        <div className="flex gap-2">
            <button onClick={toggleAudio} className={`px-4 py-3 border backdrop-blur-md text-xs uppercase tracking-widest transition-colors ${audioEnabled ? 'bg-green-900/30 border-green-500/50 text-green-200' : 'bg-gray-900/30 border-gray-600/50 text-gray-400'}`}>
                {audioEnabled ? 'Audio ON' : 'Audio OFF'}
            </button>
            <button onClick={togglePhoto} className="px-4 py-3 bg-gray-900/30 border border-gray-600/50 backdrop-blur-md text-gray-300 hover:text-white hover:bg-white/10 text-xs uppercase tracking-widest">
                Photo Mode
            </button>
            <button 
            onClick={onGenerate}
            disabled={isLoading}
            className={`px-6 py-3 bg-cyan-900/30 border border-cyan-500/50 backdrop-blur-md text-cyan-100 font-tech uppercase tracking-widest text-sm hover:bg-cyan-500/20 transition-all flex items-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
            >
            {isLoading ? "Simulating..." : "⟳ Generate World"}
            </button>
        </div>
      </header>
      
      {/* Loading Overlay */}
      {isLoading && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-cyan-500/50 px-8 py-4 rounded-full">
               <span className="text-cyan-400 animate-pulse font-tech tracking-widest uppercase">{loadingMessage || "Processing..."}</span>
          </div>
      )}

      {/* Challenge HUD */}
      {challenge.active && (
         <div className="absolute top-20 right-6 w-64 bg-yellow-900/20 backdrop-blur-md border border-yellow-500/50 p-4 pointer-events-auto">
             <h4 className="text-yellow-400 font-bold uppercase text-xs tracking-widest mb-2 flex justify-between">
                 <span>Terraforming Goal</span>
                 {challenge.success && <span className="text-green-400">SUCCESS</span>}
             </h4>
             <p className="text-xs text-yellow-100 mb-3 leading-relaxed">{challenge.description}</p>
             <div className="space-y-2">
                 {challenge.targetStats.cloudDensity !== undefined && (
                     <div className="flex justify-between text-[10px] text-gray-400">
                         <span>Target Clouds: {challenge.targetStats.cloudDensity}</span>
                         <span className={Math.abs(params.cloudDensity - challenge.targetStats.cloudDensity) < 0.1 ? "text-green-400" : "text-red-400"}>
                            Curr: {params.cloudDensity.toFixed(1)}
                         </span>
                     </div>
                 )}
                 {challenge.targetStats.habitabilityScore !== undefined && (
                     <div className="flex justify-between text-[10px] text-gray-400">
                         <span>Target Hab: {challenge.targetStats.habitabilityScore}</span>
                         <span className={lore.habitabilityScore >= challenge.targetStats.habitabilityScore ? "text-green-400" : "text-red-400"}>
                            Curr: {lore.habitabilityScore}
                         </span>
                     </div>
                 )}
             </div>
         </div>
      )}

      {/* POI Modal */}
      {selectedPOI && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-black/80 backdrop-blur-xl border border-cyan-500 p-6 pointer-events-auto z-50 shadow-[0_0_50px_rgba(0,255,255,0.2)]">
              <h3 className="text-cyan-400 font-sci-fi text-xl mb-2">{selectedPOI.title}</h3>
              <div className="text-[10px] text-gray-500 mb-4 font-mono">
                  LAT: {selectedPOI.coordinates.y.toFixed(4)} | LON: {selectedPOI.coordinates.x.toFixed(4)}
              </div>
              <p className="text-gray-200 font-tech text-sm leading-relaxed mb-4 border-l-2 border-cyan-500/30 pl-3">
                  {selectedPOI.description}
              </p>
              <button onClick={closePOI} className="w-full py-2 bg-cyan-900/50 hover:bg-cyan-800 text-cyan-200 text-xs uppercase tracking-widest">
                  Close Report
              </button>
          </div>
      )}

      {/* Surface Probe Overlay */}
      {isProbeLanding && (
         <div className="absolute inset-0 bg-cyan-900/10 pointer-events-none flex items-center justify-center z-40">
            <div className="w-[80%] h-[80%] border-2 border-cyan-500/30 relative flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExODk2ODk0ZDI0NzQxNzY1NjY1YjY5YjY5YjY5YjY5YjY5YjY5/3o7TKs4x94h938637i/giphy.gif')] opacity-10 bg-cover mix-blend-screen"></div>
                <div className="text-center">
                    <h2 className="text-4xl font-sci-fi text-white animate-pulse">ESTABLISHING LINK...</h2>
                    <p className="text-cyan-400 font-tech mt-2 tracking-widest">DESCENDING TO SURFACE</p>
                </div>
            </div>
         </div>
      )}

      {/* Main Info Panel */}
      <main className="flex flex-col md:flex-row justify-between items-end gap-6 pointer-events-auto">
        
        {/* LEFT: Dashboard */}
        <div className="w-full md:w-80 bg-black/80 backdrop-blur-md border border-gray-800 shadow-2xl flex flex-col">
           {/* Tabs */}
           <div className="flex px-4 pt-4 border-b border-gray-800 gap-1">
                <TabButton active={params.dataLayer === 'visual'} label="Visual" onClick={() => updateParams({ dataLayer: 'visual' })} />
                <TabButton active={params.dataLayer === 'thermal'} label="Thermal" onClick={() => updateParams({ dataLayer: 'thermal' })} />
                <TabButton active={params.dataLayer === 'population'} label="Pop" onClick={() => updateParams({ dataLayer: 'population' })} />
                <TabButton active={params.dataLayer === 'vegetation'} label="Bio" onClick={() => updateParams({ dataLayer: 'vegetation' })} />
           </div>

           <div className="p-4 space-y-4">
               {/* Controls */}
               <div>
                  <h4 className="text-[10px] uppercase text-cyan-500 font-bold mb-3 tracking-widest">Atmospheric Composition</h4>
                  <Slider label="Cloud Density" value={params.cloudDensity} min={0} max={1} onChange={(v) => updateParams({ cloudDensity: v })} />
                  <Slider label="Snow Cover (Ice Age)" value={params.snowLevel} min={0} max={1} onChange={(v) => updateParams({ snowLevel: v })} />
                  <Slider label="Toxicity (Murkiness)" value={params.waterMurkiness} min={0} max={1} onChange={(v) => updateParams({ waterMurkiness: v })} />
               </div>

               <div>
                  <h4 className="text-[10px] uppercase text-cyan-500 font-bold mb-3 tracking-widest">Star System</h4>
                  <div className="flex gap-2">
                     {(['yellow', 'red', 'blue'] as SunType[]).map(type => (
                         <button 
                           key={type}
                           onClick={() => updateParams({ sunType: type })}
                           className={`flex-1 py-1 text-[10px] uppercase border ${params.sunType === type ? 'bg-white/20 border-white text-white' : 'border-gray-700 text-gray-500'}`}
                         >
                            {type}
                         </button>
                     ))}
                  </div>
               </div>

               {/* Advanced Controls */}
               <div className="grid grid-cols-2 gap-2">
                    <button onClick={onEvolve} className="py-2 bg-purple-900/40 hover:bg-purple-800 border border-purple-500/30 text-[9px] uppercase tracking-wider text-purple-200">
                        Evolution Step (+1ky)
                    </button>
                    <button onClick={onDisaster} className="py-2 bg-red-900/40 hover:bg-red-800 border border-red-500/30 text-[9px] uppercase tracking-wider text-red-200">
                        Trigger Event
                    </button>
                    <button onClick={onChallenge} className="col-span-2 py-2 bg-yellow-900/40 hover:bg-yellow-800 border border-yellow-500/30 text-[9px] uppercase tracking-wider text-yellow-200">
                        Start Terraforming Challenge
                    </button>
               </div>

               <div className="flex gap-2 pt-2 border-t border-gray-800">
                    <button 
                        onClick={() => updateParams({ showSatellites: !params.showSatellites })}
                        className={`flex-1 py-2 text-[10px] uppercase font-bold tracking-wider ${params.showSatellites ? 'bg-cyan-900 text-cyan-200' : 'bg-gray-800 text-gray-400'}`}
                    >
                        Satellites
                    </button>
                    <button 
                        onClick={toggleProbe}
                        className={`flex-1 py-2 text-[10px] uppercase font-bold tracking-wider ${isProbeLanding ? 'bg-red-900 text-red-200' : 'bg-gray-800 text-gray-400'}`}
                    >
                        {isProbeLanding ? 'Abort' : 'Land Probe'}
                    </button>
               </div>
           </div>
        </div>

        {/* RIGHT: Lore */}
        <div className="w-full md:max-w-md bg-black/60 backdrop-blur-md border-r-2 border-purple-500/50 p-6 shadow-2xl text-right">
          <h2 className="text-3xl font-sci-fi mb-2 text-white">{lore.name}</h2>
          <div className="flex flex-col items-end">
            <span className="px-2 py-0.5 bg-purple-900/50 border border-purple-500/30 text-[10px] uppercase tracking-widest text-purple-200 mb-2">
              Civilization: {lore.civilizationType}
            </span>
            <p className="font-tech text-md text-gray-300 leading-relaxed mb-4">
              {lore.description}
            </p>
            <div className="w-full">
               <StatBar label="Habitability" value={lore.habitabilityScore} color={lore.habitabilityScore > 80 ? 'bg-green-400' : 'bg-yellow-400'} />
            </div>
            <div className="mt-2 text-[10px] text-gray-500 uppercase tracking-widest">
                Interact with the globe to scan sectors
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};
