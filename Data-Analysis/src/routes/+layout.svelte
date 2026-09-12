<script lang="ts">
  import { page } from '$app/stores';
  import { Home, Activity, UploadCloud } from 'lucide-svelte';
  import './layout.css';
  
  let { children } = $props();
</script>

<div class="dark min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30">
  <header class="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="container flex h-16 max-w-7xl mx-auto items-center justify-between px-6">
      <div class="flex items-center gap-2">
        <div class="h-6 w-6 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#fdb515]"></div>
        <span class="font-bold tracking-tight">Formula Electric</span>
      </div>
      
      <nav class="flex items-center gap-6 text-sm font-medium">
        <a 
          href="/" 
          class="flex items-center gap-2 transition-colors hover:text-foreground/80 {$page.url.pathname === '/' ? 'text-foreground' : 'text-foreground/60'}"
        >
          <Home class="h-4 w-4" />
          Home
        </a>
        <a 
          href="/telemetry" 
          class="flex items-center gap-2 transition-colors hover:text-foreground/80 {$page.url.pathname === '/telemetry' ? 'text-foreground' : 'text-foreground/60'}"
        >
          <Activity class="h-4 w-4" />
          Telemetry
        </a>
        <a 
          href="/upload" 
          class="flex items-center gap-2 transition-colors hover:text-foreground/80 {$page.url.pathname === '/upload' ? 'text-foreground' : 'text-foreground/60'}"
        >
          <UploadCloud class="h-4 w-4" />
          Ingestion
        </a>
      </nav>
    </div>
  </header>

  <!-- Page Content is injected here -->
  {@render children()}
</div>