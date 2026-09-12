<script lang="ts">
  import { Activity, UploadCloud } from 'lucide-svelte';
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:ital,wght@0,600;0,900;1,600&family=Bebas+Neue&display=swap" rel="stylesheet">
</svelte:head>

<div class="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-[#030303] flex flex-col justify-between selection:bg-[#fdb515]/30">
  
  <!-- Subtle Grid/CAD Background Pattern -->
  <div class="absolute inset-0 opacity-10 pointer-events-none" 
       style="background-image: linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px); background-size: 50px 50px; transform: perspective(500px) rotateX(60deg) scale(2); transform-origin: top center;">
  </div>

  <!-- FULL-SCREEN AURORA / WIND-TUNNEL BACKGROUND -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <div class="absolute w-[180%] h-[120px] bg-[#fdb515] blur-[60px] transform rotate-[-12deg] -translate-x-[20%] top-[35%] opacity-60 wind-flow"></div>
    <div class="absolute w-[200%] h-[160px] bg-[#3b82f6] blur-[80px] transform rotate-[-8deg] -translate-x-[10%] top-[40%] opacity-50 wind-flow-alt"></div>
    <div class="absolute w-[150%] h-[80px] bg-white blur-[40px] transform rotate-[-10deg] translate-x-[10%] top-[45%] opacity-70 wind-flow-fast"></div>
  </div>

  <!-- TOP SECTION: Overlapping Typography -->
  <div class="relative w-full pt-20 md:pt-28 flex flex-col items-center justify-center z-20 select-none">
    
    <!-- Massive Background Text -->
    <div class="flex flex-col items-center text-[#1e3a8a] leading-[0.75] font-['Bebas_Neue'] tracking-tight transform scale-y-[1.3]">
      <h1 class="text-[14vw] md:text-[12vw] m-0 p-0 drop-shadow-2xl">TELEMETRY</h1>
      <h1 class="text-[16vw] md:text-[13vw] m-0 p-0 drop-shadow-2xl">ANALYTICS</h1>
    </div>

    <!-- Script Overlay Text -->
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none transform translate-y-3 md:translate-y-5">
      <h2 class="font-['Great_Vibes'] text-white text-4xl md:text-6xl lg:text-7xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] -rotate-2">
        Formula Electric at Berkeley
      </h2>
    </div>
    
  </div>

  <!-- VEHICLE SHOWCASE -->
  <div class="relative z-10 w-full max-w-5xl mx-auto px-6 -mt-16 md:-mt-24 pointer-events-none flex justify-center">
    <img 
      src="/car.png" 
      alt="Formula Electric Vehicle" 
      class="w-full h-auto object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)] opacity-90"
    />
  </div>

  <!-- MIDDLE SPACER -->
  <div class="flex-1"></div>

  <!-- BOTTOM SECTION: CTAs (Moved up with reduced padding) -->
  <div class="relative z-30 container mx-auto px-6 pb-6 pt-2 flex items-center justify-center">
    <div class="flex flex-col sm:flex-row items-center gap-6 shrink-0 w-full md:w-auto">
      <a 
        href="/telemetry" 
        class="group relative flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-5 text-sm font-bold uppercase tracking-widest rounded-none bg-[#3b82f6] text-white overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
      >
        <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
        <Activity class="h-5 w-5 relative z-10" />
        <span class="relative z-10">Launch Dashboard</span>
      </a>
      
      <a 
        href="/upload" 
        class="group flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-5 text-sm font-bold uppercase tracking-widest rounded-none bg-transparent border border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-all"
      >
        <UploadCloud class="h-5 w-5" />
        <span>Ingest Data</span>
      </a>
    </div>
  </div>

</div>

<style>
  :global(html), :global(body) {
    background-color: #030303;
    overscroll-behavior-y: none;
  }

  .wind-flow {
    animation: flow 6s ease-in-out infinite alternate;
  }
  .wind-flow-alt {
    animation: flow-alt 8s linear infinite;
  }
  .wind-flow-fast {
    animation: flow 4s ease-in-out infinite alternate-reverse;
  }

  @keyframes flow {
    0% { transform: rotate(-12deg) translateX(-15%) scaleX(0.9); }
    100% { transform: rotate(-10deg) translateX(5%) scaleX(1.1); }
  }
  
  @keyframes flow-alt {
    0% { transform: rotate(-8deg) translateX(-5%) translateY(-1rem); }
    50% { transform: rotate(-6deg) translateX(10%) translateY(1rem); }
    100% { transform: rotate(-8deg) translateX(-5%) translateY(-1rem); }
  }
</style>