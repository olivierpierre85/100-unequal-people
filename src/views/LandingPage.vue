<template>
  <div class="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
    <!-- Decorative background elements -->
    <div class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950 z-0"></div>
    <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl z-0 animate-pulse"></div>
    <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl z-0 animate-pulse delay-1000"></div>

    <div class="relative z-10 max-w-4xl w-full text-center space-y-12">
      <header class="space-y-6">
        <h1 class="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 drop-shadow-lg">
          100 Unequal People
        </h1>
        <p class="text-xl md:text-2xl text-neutral-400 font-light max-w-2xl mx-auto tracking-wide">
          Illustrating inequality through the lives of 100 fictional Belgians.
        </p>
      </header>
      
      <div class="glass-panel p-8 md:p-12 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-colors duration-500">
        <p class="text-lg md:text-xl text-neutral-300 leading-relaxed font-light">
          We generate <span class="text-white font-medium">100 profiles</span> based on real income and wealth data.
          Discover where you truly stand in the hierarchy—are you as <span class="italic">"middle class"</span> as you think?
        </p>
      </div>

      <div class="pt-8">
        <button class="group relative px-10 py-5 bg-white text-black font-bold text-lg rounded-full overflow-hidden transition-transform duration-300 hover:scale-105 active:scale-95 shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)]">
          <span class="relative z-10 group-hover:text-white transition-colors duration-300">Explore the 100 Profiles</span>
          <div class="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0"></div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.glass-panel {
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}
</style>
