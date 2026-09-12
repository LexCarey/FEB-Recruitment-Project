<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Loader2, UploadCloud, CheckCircle2, AlertCircle, Trash2 } from "lucide-svelte";

  let uploading = $state(false);
  let resetting = $state(false);
  let status = $state<'idle' | 'loading' | 'success' | 'error'>('idle');
  let statusMessage = $state('');

  async function handleUpload(event: SubmitEvent) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    uploading = true;
    status = 'loading';
    statusMessage = 'Uploading and streaming to ClickHouse...';

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (response.ok) {
        status = 'success';
        statusMessage = 'Success! 1.4M rows ingested into ClickHouse.';
        form.reset();
      } else {
        status = 'error';
        statusMessage = `Error: ${result.message}`;
      }
    } catch (e) {
      status = 'error';
      statusMessage = 'Upload failed due to a network error.';
      console.error(e);
    } finally {
      uploading = false;
    }
  }

  async function handleReset() {
    if (!confirm('Are you sure you want to clear all telemetry data? This action cannot be undone.')) {
      return;
    }

    resetting = true;
    status = 'loading';
    statusMessage = 'Executing TRUNCATE on ClickHouse database...';

    try {
      const response = await fetch('/api/reset', { method: 'POST' });
      
      if (response.ok) {
        status = 'success';
        statusMessage = 'Database successfully reset. Ready for new ingestion.';
      } else {
        status = 'error';
        statusMessage = 'Error: Failed to reset the database.';
      }
    } catch (e) {
      status = 'error';
      statusMessage = 'Reset failed due to a network error.';
      console.error(e);
    } finally {
      resetting = false;
    }
  }
</script>

<div class="dark min-h-screen w-full bg-background text-foreground flex items-center justify-center p-6 selection:bg-primary/30">
  <Card.Root class="w-full max-w-lg shadow-xl border-border/50 bg-card">
    <Card.Header class="space-y-1 pb-6 border-b border-border/50">
      <div class="flex items-center gap-2">
        <div class="p-2 bg-primary/10 rounded-lg">
          <UploadCloud class="w-5 h-5 text-primary" />
        </div>
        <Card.Title class="text-2xl font-bold tracking-tight">Data Ingestion</Card.Title>
      </div>
      <Card.Description class="text-muted-foreground">
        Upload Formula Electric CAN bus logs or reset the active ClickHouse tables.
      </Card.Description>
    </Card.Header>

    <Card.Content class="pt-6">
      <form onsubmit={handleUpload} class="space-y-6">
        <div class="space-y-3">
          <Label for="file" class="text-sm font-medium">Select CSV Log File</Label>
          <Input 
            type="file" 
            id="file" 
            name="file" 
            accept=".csv" 
            required 
            disabled={uploading || resetting}
            class="file:bg-muted file:text-muted-foreground file:border-0 file:rounded-md file:px-4 file:py-1 file:mr-4 file:text-sm file:font-medium hover:file:bg-muted/80 cursor-pointer h-12 pt-2.5"
          />
        </div>

        <Button 
          type="submit" 
          disabled={uploading || resetting}
          class="w-full font-bold h-11"
        >
          {#if uploading}
            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
            Processing 1.4M Rows...
          {:else}
            Upload & Ingest
          {/if}
        </Button>
      </form>

      <div class="relative my-8">
        <div class="absolute inset-0 flex items-center">
          <span class="w-full border-t border-border/50"></span>
        </div>
        <div class="relative flex justify-center text-xs uppercase">
          <span class="bg-card px-2 text-muted-foreground font-semibold tracking-wider">Danger Zone</span>
        </div>
      </div>

      <Button 
        type="button" 
        variant="destructive"
        disabled={uploading || resetting}
        onclick={handleReset}
        class="w-full font-bold h-11 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground border border-destructive/20"
      >
        {#if resetting}
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
          Clearing Database...
        {:else}
          <Trash2 class="mr-2 h-4 w-4" />
          Reset Database
        {/if}
      </Button>

      {#if status !== 'idle'}
        <div class="mt-6 p-4 rounded-lg border flex items-start gap-3 
          {status === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 
           status === 'error' ? 'bg-destructive/10 border-destructive/20 text-destructive' : 
           'bg-muted/50 border-border text-muted-foreground'}">
          
          {#if status === 'success'}
            <CheckCircle2 class="w-5 h-5 shrink-0 mt-0.5" />
          {:else if status === 'error'}
            <AlertCircle class="w-5 h-5 shrink-0 mt-0.5" />
          {:else}
            <Loader2 class="w-5 h-5 shrink-0 animate-spin mt-0.5" />
          {/if}
          
          <p class="text-sm font-medium leading-relaxed">{statusMessage}</p>
        </div>
      {/if}
    </Card.Content>
  </Card.Root>
</div>