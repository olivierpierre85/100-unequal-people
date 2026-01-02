<template>
  <div class="min-h-screen bg-neutral-950 text-white p-8">
    <div class="max-w-7xl mx-auto space-y-8">
      <header class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
            The 100 Belgians
          </h1>
          <p class="text-neutral-400 mt-2">Sorted by {{ sortByLabel }}</p>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex gap-2 bg-neutral-800 p-1 rounded-lg">
            <button 
              @click="sortBy = 'wealth'" 
              :class="sortBy === 'wealth' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'"
              class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            >
              Wealth
            </button>
            <button 
              @click="sortBy = 'income'" 
              :class="sortBy === 'income' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'"
              class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            >
              Income
            </button>
          </div>
          <router-link to="/" class="px-4 py-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition">Back</router-link>
        </div>
      </header>

      <div class="overflow-x-auto bg-neutral-900/50 rounded-2xl border border-white/5 backdrop-blur-sm">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-white/10 text-neutral-400 text-sm uppercase tracking-wider">
              <th class="p-4 font-medium">Rank</th>
              <th class="p-4 font-medium">Age / Gender</th>
              <th class="p-4 font-medium">Region</th>
              <th 
                class="p-4 font-medium text-right cursor-pointer hover:text-white transition-colors"
                @click="sortBy = 'income'"
              >
                Net Income / Mo
                <span v-if="sortBy === 'income'" class="ml-1">▼</span>
              </th>
              <th 
                class="p-4 font-medium text-right cursor-pointer hover:text-white transition-colors"
                @click="sortBy = 'wealth'"
              >
                Net Wealth
                <span v-if="sortBy === 'wealth'" class="ml-1">▼</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr v-for="(person, index) in sortedProfiles" :key="person.id" class="hover:bg-white/5 transition-colors">
              <td class="p-4 font-mono text-neutral-500">#{{ index + 1 }}</td>
              <td class="p-4">
                <div class="font-medium text-white">{{ person.demographics.age }} years</div>
                <div class="text-sm text-neutral-500">{{ person.demographics.gender }}</div>
              </td>
              <td class="p-4">
                <span :class="{
                  'bg-yellow-500/10 text-yellow-500': person.demographics.region === 'Flanders',
                  'bg-red-500/10 text-red-500': person.demographics.region === 'Wallonia',
                  'bg-blue-500/10 text-blue-500': person.demographics.region === 'Brussels'
                }" class="px-2 py-1 rounded text-xs font-medium">
                  {{ person.demographics.region }}
                </span>
              </td>
              <td class="p-4 text-right font-mono" :class="sortBy === 'income' ? 'text-emerald-400 font-bold' : ''">
                €{{ formatMoney(person.economics.netMonthlyIncome) }}
              </td>
              <td class="p-4 text-right font-mono" :class="sortBy === 'wealth' ? 'text-emerald-400 font-bold' : ''">
                €{{ formatMoney(person.economics.netWealth) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { generateProfiles } from '../utils/generators'

const profiles = ref([])
const sortBy = ref('wealth')

const sortByLabel = computed(() => {
  return sortBy.value === 'wealth' ? 'Net Wealth' : 'Net Monthly Income'
})

const sortedProfiles = computed(() => {
  return [...profiles.value].sort((a, b) => {
    if (sortBy.value === 'wealth') {
      return a.economics.netWealth - b.economics.netWealth
    } else {
      return a.economics.netMonthlyIncome - b.economics.netMonthlyIncome
    }
  })
})

onMounted(() => {
  profiles.value = generateProfiles(100)
})

function formatMoney(amount) {
  return new Intl.NumberFormat('fr-BE').format(amount)
}
</script>
