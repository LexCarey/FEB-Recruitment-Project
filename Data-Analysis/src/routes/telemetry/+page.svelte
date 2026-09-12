<script lang="ts">
  import { SIGNAL_MAP, type TabName } from '$lib/signalConfig';
  
  import * as Card from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import * as Chart from '$lib/components/ui/chart';
  import { LineChart, AreaChart } from 'layerchart';

  let loading = $state(false);
  let telemetryData = $state<any[]>([]);
  let selectedTab = $state<TabName>('Inverter - Powertrain');
  
  let hiddenSeries = $state<Set<string>>(new Set());

  const tabs = Array.from(new Set(Object.values(SIGNAL_MAP).map(def => def.tab)));

  function toggleSeries(key: string) {
    const nextHidden = new Set(hiddenSeries);
    if (nextHidden.has(key)) {
      nextHidden.delete(key);
    } else {
      nextHidden.add(key);
    }
    hiddenSeries = nextHidden;
  }

  function getSeriesColor(index: number) {
    if (index === 0) return "#3b82f6"; // Brighter UI Blue
    if (index === 1) return "#fdb515"; // California Gold
    if (index === 2) return "#16a34a"; // Green
    if (index === 3) return "#dc2626"; // Red
    if (index === 4) return "#9333ea"; // Purple
    return "#0ea5e9"; // Light Blue
  }

  function calculateActivePercentage(data: any[], key: string) {
    if (data.length < 2) return "0.0";
    let activeTime = 0;
    const totalTime = data[data.length - 1].timeSeconds - data[0].timeSeconds;
    if (totalTime <= 0) return "0.0";

    for (let i = 0; i < data.length - 1; i++) {
      if (data[i][key]) { 
        activeTime += (data[i+1].timeSeconds - data[i].timeSeconds);
      }
    }
    return ((activeTime / totalTime) * 100).toFixed(1);
  }

  function calculateStatePercentages(data: any[], key: string) {
    if (data.length < 2) return [];
    const stateDurations: Record<number, { duration: number, name: string }> = {};
    let totalTime = 0;

    for (let i = 0; i < data.length - 1; i++) {
      const val = data[i][key];
      const physical = data[i][`${key}_physical`];
      const duration = data[i+1].timeSeconds - data[i].timeSeconds;
      
      if (val !== undefined && !isNaN(val)) {
        if (!stateDurations[val]) {
          stateDurations[val] = { duration: 0, name: physical || `State ${val}` };
        }
        stateDurations[val].duration += duration;
        
        if (physical && stateDurations[val].name.startsWith('State')) {
          stateDurations[val].name = physical;
        }
        
        totalTime += duration;
      }
    }

    if (totalTime <= 0) return [];

    return Object.entries(stateDurations)
      .map(([val, info]) => ({
        state: Number(val),
        name: info.name,
        percentage: ((info.duration / totalTime) * 100).toFixed(1)
      }))
      .sort((a, b) => Number(b.percentage) - Number(a.percentage));
  }

  $effect(() => {
    const fetchTabData = async () => {
      loading = true;
      hiddenSeries = new Set(); 
      
      const requiredSignals = Object.entries(SIGNAL_MAP)
        .filter(([_, config]) => config.tab === selectedTab)
        .map(([name, _]) => name);

      if (requiredSignals.length === 0) {
        telemetryData = [];
        loading = false;
        return;
      }

      try {
        const params = new URLSearchParams({ signals: requiredSignals.join(',') });
        const res = await fetch(`/api/telemetry?${params}`);
        const result = await res.json();
        telemetryData = result.data || [];
      } catch (e) {
        console.error(e);
      } finally {
        loading = false;
      }
    };

    fetchTabData();
  });

  const fullTimeSeries = $derived.by(() => {
    const map = new Map();
    const allKeys = new Set<string>();
    const uniqueStates = new Map<string, Set<number>>();
    
    for (const row of telemetryData) {
      if (!row || !row.name || row.timestamp == null) continue;
      
      const ts = Number(row.timestamp);
      const timeSeconds = ts / 1000;
      const val = Number(row.value);
      
      if (!map.has(ts)) {
        map.set(ts, { timestamp: ts, timeSeconds });
      }
      map.get(ts)[row.name] = val;
      if (row.physical_value) {
        map.get(ts)[`${row.name}_physical`] = row.physical_value;
      }
      allKeys.add(row.name);

      if (SIGNAL_MAP[row.name]?.type === 'status-badge') {
        if (!uniqueStates.has(row.name)) uniqueStates.set(row.name, new Set());
        uniqueStates.get(row.name)?.add(val);
      }
    }
    
    const sortedArray = Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
    if (sortedArray.length === 0) return [];

    let lastKnown: Record<string, number> = {};
    let lastKnownPhysical: Record<string, string> = {};
    
    for (const key of allKeys) {
      const firstRowWithValue = sortedArray.find(r => r[key] !== undefined && !isNaN(r[key]));
      lastKnown[key] = firstRowWithValue ? firstRowWithValue[key] : 0;
      lastKnownPhysical[key] = firstRowWithValue && firstRowWithValue[`${key}_physical`] ? firstRowWithValue[`${key}_physical`] : '';
    }
    
    for (let i = 0; i < sortedArray.length; i++) {
      const row = sortedArray[i];
      for (const key of allKeys) {
        if (row[key] === undefined || isNaN(row[key])) {
          row[key] = lastKnown[key];
          row[`${key}_physical`] = lastKnownPhysical[key];
        } else {
          lastKnown[key] = row[key];
          if (row[`${key}_physical`]) {
            lastKnownPhysical[key] = row[`${key}_physical`];
          } else {
            row[`${key}_physical`] = lastKnownPhysical[key];
          }
        }
      }

      for (const [sKey, states] of uniqueStates.entries()) {
        const currentVal = row[sKey];
        for (const state of states) {
          row[`${sKey}_state_${state}`] = currentVal === state ? 1 : 0;
        }
      }
    }
    
    return sortedArray;
  });

  const dashboardPanels = $derived.by(() => {
    const panels = new Map();
    
    for (const row of telemetryData) {
      if (!row || !row.name) continue;
      
      const config = SIGNAL_MAP[row.name];
      if (!config) continue;
      
      const val = Number(row.value);
      
      if (config.type === 'multi-line' && config.chartGroup) {
        if (!panels.has(config.chartGroup)) {
          panels.set(config.chartGroup, {
            title: config.chartGroup,
            tab: config.tab,
            type: 'multi-line',
            keys: [], 
            latestValues: {}
          });
        }
        const panel = panels.get(config.chartGroup);
        if (!panel.keys.includes(row.name)) panel.keys.push(row.name);
        panel.latestValues[row.name] = val;
      } 
      else {
        if (!panels.has(row.name)) {
          panels.set(row.name, {
            title: row.name,
            tab: config.tab,
            type: config.type,
            keys: [row.name], 
            unit: config.unit,
            latestValue: val,
            maxValue: val,
            minValue: val,
            physicalValue: row.physical_value
          });
        } else {
          const panel = panels.get(row.name);
          panel.latestValue = val;
          panel.physicalValue = row.physical_value;
          
          if (val > panel.maxValue) {
            panel.maxValue = val;
          }
          if (val < panel.minValue) {
            panel.minValue = val;
          }
        }
      }
    }
    
    return Array.from(panels.values());
  });
</script>

<div class="dark flex min-h-screen w-full bg-background text-foreground md:flex-row flex-col selection:bg-primary/30">
  
  <aside class="md:w-72 shrink-0 border-r bg-muted/10 md:h-screen md:sticky top-0 p-6 flex flex-col gap-8 overflow-y-auto z-10">
    <div class="flex flex-col gap-1">
      <h1 class="text-2xl font-bold tracking-tight">Command Center</h1>
      <p class="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Formula Electric</p>
    </div>

    <nav class="flex flex-col gap-2">
      <span class="text-xs font-semibold text-muted-foreground mb-2">TELEMETRY SUBSYSTEMS</span>
      {#each tabs as tab}
        <button
          onclick={() => (selectedTab = tab)}
          class="text-left px-4 py-3 text-sm font-medium rounded-xl transition-all border {selectedTab === tab ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-transparent border-transparent hover:bg-muted hover:border-border text-muted-foreground'}"
        >
          {tab}
        </button>
      {/each}
    </nav>
  </aside>

  <main class="flex-1 p-6 md:p-12 space-y-8 max-w-7xl">
    
    <div class="flex flex-col gap-2 border-b border-border/50 pb-6">
      <h2 class="text-3xl font-bold tracking-tight">{selectedTab}</h2>
      <p class="text-muted-foreground text-sm">Real-time telemetry and component visualization.</p>
    </div>

    {#if loading}
      <div class="p-12 text-center text-muted-foreground animate-pulse">Loading {selectedTab} telemetry database...</div>
    {:else if dashboardPanels.length === 0}
      <div class="p-12 text-center text-muted-foreground border border-border/50 rounded-xl bg-card">No active telemetry found for {selectedTab}.</div>
    {:else}
      <div class="grid grid-cols-1 gap-8">
        
        {#each dashboardPanels as panel}
          <Card.Root class="flex flex-col justify-between overflow-hidden border border-border/50 shadow-sm rounded-xl bg-card">
            <Card.Header class="pb-2 bg-muted/20 border-b border-border/50">
              <Card.Title class="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {panel.title}
              </Card.Title>
            </Card.Header>
            
            <Card.Content class="pt-6">
              
              {#if panel.type === 'multi-line'}
                {@const chartConfig = Object.fromEntries(panel.keys.map((k: string, i: number) => [k, { label: k, color: getSeriesColor(i) }]))}
                <div class="space-y-4">
                  <div class="flex flex-wrap gap-6">
                    {#each panel.keys as key, i}
                      <button 
                        onclick={() => toggleSeries(key)}
                        class="flex flex-col text-left transition-all hover:opacity-80 {hiddenSeries.has(key) ? 'opacity-30 grayscale' : 'opacity-100'}"
                      >
                        <div class="flex items-center gap-2">
                          <div class="h-2.5 w-2.5 rounded-full shadow-sm" style="background-color: {getSeriesColor(i)}"></div>
                          <span class="text-xs text-muted-foreground font-medium truncate max-w-[200px]" title={key}>{key}</span>
                        </div>
                        <span class="font-mono font-bold text-3xl mt-1">{panel.latestValues[key]}</span>
                      </button>
                    {/each}
                  </div>
                  
                  <div class="h-72 w-full mt-6">
                    <Chart.Container config={chartConfig} class="h-full w-full">
                      <LineChart 
                        data={fullTimeSeries} 
                        x="timeSeconds" 
                        series={panel.keys
                          .filter((k: string) => !hiddenSeries.has(k))
                          .map((k: string) => ({ 
                            key: k, 
                            color: chartConfig[k].color 
                          }))}
                        props={{ line: { strokeWidth: 2 } }} 
                      />
                    </Chart.Container>
                  </div>
                </div>

              {:else if panel.type === 'line-chart'}
                {@const k = panel.keys[0]}
                {@const singleChartConfig = { [k]: { label: k, color: getSeriesColor(0) } }}
                <div class="space-y-4">
                  <div class="flex items-center justify-between border-b border-border/50 pb-4">
                    
                    <div class="flex flex-col">
                      <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Current</span>
                      <div class="flex items-baseline gap-2">
                        <span class="text-5xl font-bold font-mono tracking-tighter text-primary">{panel.latestValue}</span>
                        <span class="text-base font-semibold text-muted-foreground">{panel.unit ?? ''}</span>
                      </div>
                    </div>

                    <div class="flex gap-6 border-l border-border/50 pl-6">
                      <div class="flex flex-col text-right">
                        <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Lowest</span>
                        <span class="text-2xl font-bold font-mono tracking-tighter text-muted-foreground">
                          {panel.minValue} <span class="text-sm font-semibold">{panel.unit ?? ''}</span>
                        </span>
                      </div>
                      <div class="flex flex-col text-right">
                        <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Peak</span>
                        <span class="text-2xl font-bold font-mono tracking-tighter text-muted-foreground">
                          {panel.maxValue} <span class="text-sm font-semibold">{panel.unit ?? ''}</span>
                        </span>
                      </div>
                    </div>

                  </div>
                  
                  <div class="h-56 w-full mt-4">
                    <Chart.Container config={singleChartConfig} class="h-full w-full">
                      <LineChart 
                        data={fullTimeSeries} 
                        x="timeSeconds" 
                        y={k}
                        series={[{ key: k, color: getSeriesColor(0) }]} 
                        props={{ line: { strokeWidth: 2 } }}
                      />
                    </Chart.Container>
                  </div>
                </div>
                
              {:else if panel.type === 'toggle-pill'}
                {@const k = panel.keys[0]}
                {@const activePercent = calculateActivePercentage(fullTimeSeries, k)}
                {@const binaryChartConfig = { [k]: { label: k, color: "#fdb515" } }}
                <div class="space-y-4">
                  <div class="flex items-center justify-between border-b border-border/50 pb-4">
                    <div class="flex flex-col">
                      <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Time Active</span>
                      <span class="text-3xl font-bold font-mono tracking-tighter">{activePercent}%</span>
                    </div>
                    <Badge variant={panel.latestValue ? 'default' : 'secondary'} class="px-4 py-1 text-sm">
                      {panel.latestValue ? 'CURRENTLY ACTIVE' : 'CURRENTLY OFF'}
                    </Badge>
                  </div>
                  
                  <div class="h-32 w-full mt-4">
                    <Chart.Container config={binaryChartConfig} class="h-full w-full">
                      <AreaChart 
                        data={fullTimeSeries} 
                        x="timeSeconds" 
                        y={k}
                        series={[{ key: k, color: "#fdb515" }]} 
                        props={{ 
                          line: { strokeWidth: 1.5 }, 
                          area: { fillOpacity: 0.2 } 
                        }}
                      />
                    </Chart.Container>
                  </div>
                </div>

              {:else if panel.type === 'status-badge'}
                {@const k = panel.keys[0]}
                {@const stateBreakdown = calculateStatePercentages(fullTimeSeries, k)}
                {@const stateChartConfig = Object.fromEntries(stateBreakdown.map((s, i) => [`${k}_state_${s.state}`, { label: s.name, color: getSeriesColor(i) }]))}
                <div class="space-y-4">
                  
                  <div class="flex flex-wrap gap-8 items-center justify-between border-b border-border/50 pb-4">
                    <div class="flex gap-8 flex-wrap">
                      {#each stateBreakdown as stateItem, i}
                        <div class="flex flex-col">
                          <div class="flex items-center gap-2 mb-1">
                            <div class="h-2 w-2 rounded-full shadow-sm" style="background-color: {getSeriesColor(i)}"></div>
                            <span class="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{stateItem.name}</span>
                          </div>
                          <div class="flex items-baseline gap-1.5">
                            <span class="font-mono font-bold text-2xl">{stateItem.percentage}%</span>
                            <span class="text-xs text-muted-foreground font-mono">(Val: {stateItem.state})</span>
                          </div>
                        </div>
                      {/each}
                      {#if stateBreakdown.length === 0}
                        <span class="text-sm text-muted-foreground">No state transitions recorded</span>
                      {/if}
                    </div>
                    
                    <div class="text-right flex flex-col items-end border-l border-border/50 pl-6">
                      <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Current State</span>
                      <span class="text-3xl font-bold font-mono tracking-tighter text-primary">{panel.physicalValue ?? panel.latestValue}</span>
                    </div>
                  </div>
                  
                  <div class="h-40 w-full mt-4">
                    <Chart.Container config={stateChartConfig} class="h-full w-full">
                      <AreaChart 
                        data={fullTimeSeries} 
                        x="timeSeconds" 
                        series={stateBreakdown.map((s, i) => ({ 
                          key: `${k}_state_${s.state}`, 
                          color: getSeriesColor(i) 
                        }))} 
                        props={{ 
                          line: { strokeWidth: 1.5 },
                          area: { fillOpacity: 0.2 }
                        }}
                      />
                    </Chart.Container>
                  </div>
                </div>

              {:else if panel.type === 'destructive-badge'}
                <div class="flex items-center justify-between py-2">
                  <span class="text-3xl font-bold font-mono">{panel.latestValue}</span>
                  <Badge variant={panel.latestValue !== 0 ? 'destructive' : 'secondary'} class={panel.latestValue !== 0 ? 'animate-pulse px-4 py-1 text-sm' : 'px-4 py-1 text-sm'}>
                    {panel.latestValue !== 0 ? 'FAULT DETECTED' : 'CLEAR'}
                  </Badge>
                </div>

              {:else}
                <div class="flex items-baseline gap-2 py-2">
                  <span class="text-5xl font-bold font-mono tracking-tighter">{panel.latestValue}</span>
                  <span class="text-lg font-semibold text-muted-foreground">{panel.unit ?? ''}</span>
                </div>
              {/if}

            </Card.Content>
          </Card.Root>
        {/each}
        
      </div>
    {/if}
  </main>
</div>