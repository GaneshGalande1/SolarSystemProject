import { useState, useEffect, useRef, useCallback } from 'react';
import { planets, sunData, Planet } from './data/planets';

type SelectedBody = Planet | typeof sunData | null;

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const anglesRef = useRef<number[]>(planets.map(() => Math.random() * Math.PI * 2));
  const lastTimeRef = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [selectedBody, setSelectedBody] = useState<SelectedBody>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<number | null>(null);
  const [showLabels, setShowLabels] = useState(true);

  const getPlanetPosition = useCallback((index: number, centerX: number, centerY: number) => {
    const planet = planets[index];
    const angle = anglesRef.current[index];
    const x = centerX + Math.cos(angle) * planet.orbitRadius;
    const y = centerY + Math.sin(angle) * planet.orbitRadius;
    return { x, y };
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, timestamp: number) => {
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear canvas
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, width, height);

    // Draw stars background
    const starSeed = 42;
    for (let i = 0; i < 200; i++) {
      const sx = ((starSeed * (i + 1) * 7919) % width);
      const sy = ((starSeed * (i + 1) * 6271) % height);
      const size = ((i * 3) % 3) * 0.5 + 0.5;
      const alpha = 0.3 + ((i * 7) % 10) / 20;
      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();
    }

    // Draw orbit paths
    planets.forEach((planet) => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, planet.orbitRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw Sun glow (with subtle pulse)
    const pulseScale = 1 + Math.sin(timestamp / 800) * 0.05;
    const glowRadius = sunData.size * 1.5 * pulseScale;
    const sunGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius);
    sunGradient.addColorStop(0, 'rgba(255, 221, 0, 0.8)');
    sunGradient.addColorStop(0.4, 'rgba(255, 160, 0, 0.4)');
    sunGradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
    ctx.beginPath();
    ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
    ctx.fillStyle = sunGradient;
    ctx.fill();

    // Draw Sun
    const sunBodyGradient = ctx.createRadialGradient(centerX - 5, centerY - 5, 0, centerX, centerY, sunData.size);
    sunBodyGradient.addColorStop(0, '#fff8e0');
    sunBodyGradient.addColorStop(0.3, '#ffdd00');
    sunBodyGradient.addColorStop(0.7, '#ffaa00');
    sunBodyGradient.addColorStop(1, '#ff6600');
    ctx.beginPath();
    ctx.arc(centerX, centerY, sunData.size, 0, Math.PI * 2);
    ctx.fillStyle = sunBodyGradient;
    ctx.fill();

    // Draw planets
    planets.forEach((planet, index) => {
      const { x, y } = getPlanetPosition(index, centerX, centerY);
      const isHovered = hoveredPlanet === index;
      const isSelected = selectedBody && 'name' in selectedBody && selectedBody.name === planet.name;
      const displaySize = planet.size * (isHovered || isSelected ? 1.3 : 1);

      // Planet glow when hovered/selected
      if (isHovered || isSelected) {
        ctx.beginPath();
        ctx.arc(x, y, displaySize + 6, 0, Math.PI * 2);
        ctx.fillStyle = `${planet.color}33`;
        ctx.fill();
      }

      // Planet body
      const planetGradient = ctx.createRadialGradient(
        x - displaySize * 0.3, y - displaySize * 0.3, 0,
        x, y, displaySize
      );
      planetGradient.addColorStop(0, lightenColor(planet.color, 40));
      planetGradient.addColorStop(0.7, planet.color);
      planetGradient.addColorStop(1, darkenColor(planet.color, 30));
      ctx.beginPath();
      ctx.arc(x, y, displaySize, 0, Math.PI * 2);
      ctx.fillStyle = planetGradient;
      ctx.fill();

      // Saturn's rings
      if (planet.name === 'Saturn') {
        ctx.beginPath();
        ctx.ellipse(x, y, displaySize * 1.8, displaySize * 0.5, -0.3, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(240, 216, 144, 0.6)';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Labels
      if (showLabels) {
        ctx.font = `${isHovered || isSelected ? 'bold ' : ''}11px Inter, system-ui, sans-serif`;
        ctx.fillStyle = isHovered || isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.7)';
        ctx.textAlign = 'center';
        ctx.fillText(planet.name, x, y + displaySize + 14);
      }
    });
  }, [getPlanetPosition, hoveredPlanet, selectedBody, showLabels]);

  const animate = useCallback((timestamp: number) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    if (isPlaying) {
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      if (deltaTime < 100) { // Skip large jumps
        planets.forEach((planet, index) => {
          const angularSpeed = (2 * Math.PI) / (planet.orbitalPeriod * 600);
          anglesRef.current[index] += angularSpeed * speed * (deltaTime / 16.67);
        });
      }
    } else {
      lastTimeRef.current = timestamp;
    }

    draw(ctx, width, height, timestamp);
    animationRef.current = requestAnimationFrame(animate);
  }, [isPlaying, speed, draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, [animate]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Check Sun click
    const sunDist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    if (sunDist <= sunData.size) {
      setSelectedBody(sunData);
      return;
    }

    // Check planet clicks
    for (let i = 0; i < planets.length; i++) {
      const pos = getPlanetPosition(i, centerX, centerY);
      const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      if (dist <= planets[i].size + 8) {
        setSelectedBody(planets[i]);
        return;
      }
    }

    setSelectedBody(null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    let found = -1;

    // Check Sun
    const sunDist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    if (sunDist <= sunData.size) {
      canvas.style.cursor = 'pointer';
      setHoveredPlanet(-1);
      return;
    }

    // Check planets
    for (let i = 0; i < planets.length; i++) {
      const pos = getPlanetPosition(i, centerX, centerY);
      const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      if (dist <= planets[i].size + 8) {
        found = i;
        break;
      }
    }

    if (found >= 0) {
      canvas.style.cursor = 'pointer';
      setHoveredPlanet(found);
    } else {
      canvas.style.cursor = 'default';
      setHoveredPlanet(null);
    }
  };

  const speedOptions = [0.25, 0.5, 1, 2, 5, 10];

  return (
    <div className="w-full h-screen flex flex-col bg-[#0a0a1a] overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-[#0d0d24]/90 border-b border-white/10 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 flex items-center justify-center">
            <span className="text-sm">☀️</span>
          </div>
          <h1 className="text-white font-bold text-lg tracking-wide">Solar System Explorer</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              showLabels
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'bg-white/5 text-white/50 border border-white/10'
            }`}
          >
            Labels
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 relative">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            className="w-full h-full"
          />

          {/* Controls Overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-[#0d0d24]/90 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 shadow-2xl">
            {/* Play/Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-indigo-500 hover:bg-indigo-400 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                  <rect x="3" y="2" width="4" height="12" rx="1" />
                  <rect x="9" y="2" width="4" height="12" rx="1" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                  <polygon points="4,2 14,8 4,14" />
                </svg>
              )}
            </button>

            {/* Speed Controls */}
            <div className="flex items-center gap-1">
              <span className="text-white/50 text-xs mr-1">Speed:</span>
              {speedOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                    speed === s
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-white/10" />

            {/* Speed slider */}
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0.1"
                max="20"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-400"
              />
              <span className="text-white/70 text-xs font-mono w-10">{speed.toFixed(1)}x</span>
            </div>
          </div>

          {/* Instructions */}
          {!selectedBody && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#0d0d24]/80 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2">
              <p className="text-white/60 text-sm">Click on any planet or the Sun to learn more</p>
            </div>
          )}
        </div>

        {/* Info Panel */}
        {selectedBody && (
          <div className="w-80 bg-[#0d0d24]/95 backdrop-blur-md border-l border-white/10 p-6 overflow-y-auto animate-slideIn">
            <button
              onClick={() => setSelectedBody(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
            >
              ✕
            </button>

            {/* Planet/Sun Header */}
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${lightenColor(selectedBody.color, 40)}, ${selectedBody.color}, ${darkenColor(selectedBody.color, 30)})`
                }}
              >
                {selectedBody.name === 'Saturn' && (
                  <div className="absolute w-24 h-6 border-2 border-[#f0d890]/60 rounded-full -rotate-12" />
                )}
              </div>
              <div>
                <h2 className="text-white font-bold text-2xl">{selectedBody.name}</h2>
                {selectedBody.name !== 'The Sun' && (
                  <p className="text-white/40 text-sm">Planet #{planets.indexOf(selectedBody as Planet) + 1}</p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-3 mb-6">
              <StatCard
                icon="📏"
                label="Diameter"
                value={`${selectedBody.diameter.toLocaleString()} km`}
                subvalue={selectedBody.name !== 'The Sun'
                  ? `${(selectedBody.diameter / 12756).toFixed(2)}× Earth`
                  : `${(selectedBody.diameter / 12756).toFixed(0)}× Earth`}
              />
              {selectedBody.name !== 'The Sun' && (
                <>
                  <StatCard
                    icon="🌍"
                    label="Distance from Sun"
                    value={`${(selectedBody as Planet).distanceFromSun.toLocaleString()} million km`}
                    subvalue={`${((selectedBody as Planet).distanceFromSun / 149.6).toFixed(2)} AU`}
                  />
                  <StatCard
                    icon="⏱️"
                    label="Orbital Period"
                    value={`${(selectedBody as Planet).orbitalPeriod} Earth years`}
                    subvalue={`≈ ${Math.round((selectedBody as Planet).orbitalPeriod * 365.25)} days`}
                  />
                </>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-white/80 font-semibold text-sm uppercase tracking-wider mb-2">About</h3>
              <p className="text-white/60 text-sm leading-relaxed">{selectedBody.description}</p>
            </div>

            {/* Fun Fact */}
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
              <h3 className="text-indigo-300 font-semibold text-sm mb-1">💡 Fun Fact</h3>
              <p className="text-white/70 text-sm leading-relaxed">{selectedBody.funFact}</p>
            </div>

            {/* Quick navigation */}
            <div className="mt-6">
              <h3 className="text-white/80 font-semibold text-sm uppercase tracking-wider mb-3">Quick Navigate</h3>
              <div className="grid grid-cols-3 gap-2">
                {planets.map((planet) => (
                  <button
                    key={planet.name}
                    onClick={() => setSelectedBody(planet)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                      selectedBody && 'name' in selectedBody && selectedBody.name === planet.name
                        ? 'bg-indigo-500/20 border border-indigo-500/30'
                        : 'bg-white/5 hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: planet.color }}
                    />
                    <span className="text-white/70 text-[10px]">{planet.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subvalue }: { icon: string; label: string; value: string; subvalue: string }) {
  return (
    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm">{icon}</span>
        <span className="text-white/40 text-xs uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-white font-semibold text-sm">{value}</p>
      <p className="text-white/40 text-xs">{subvalue}</p>
    </div>
  );
}

function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + percent);
  const g = Math.min(255, ((num >> 8) & 0x00FF) + percent);
  const b = Math.min(255, (num & 0x0000FF) + percent);
  return `rgb(${r}, ${g}, ${b})`;
}

function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - percent);
  const g = Math.max(0, ((num >> 8) & 0x00FF) - percent);
  const b = Math.max(0, (num & 0x0000FF) - percent);
  return `rgb(${r}, ${g}, ${b})`;
}

export default App;
