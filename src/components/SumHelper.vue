<template>
  <!-- A small "help me add it up" calculator: a few labelled amounts, an
       optional "shared with a partner" switch, and a running total. -->
  <div class="mt-2 rounded-2xl border border-rule bg-paper p-3">
    <p class="text-xs text-muted">{{ note }}</p>
    <div class="mt-2 grid gap-2 sm:grid-cols-2">
      <label v-for="f in fields" :key="f.key" class="block text-xs text-ink">
        {{ f.label }}
        <span class="relative mt-0.5 block">
          <input
            type="number" inputmode="numeric" :step="f.step ?? 10"
            class="field-sm pr-7"
            :value="values[f.key] ?? ''"
            @input="onInput(f.key, $event)"
          />
          <span class="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-faint">€</span>
        </span>
      </label>
    </div>
    <label v-if="sharedLabel" class="mt-3 flex items-center gap-2 text-xs text-ink">
      <input
        type="checkbox"
        class="h-4 w-4 rounded border-rule text-accent focus:ring-accent/40"
        :checked="shared"
        @change="$emit('update:shared', $event.target.checked)"
      />
      {{ sharedLabel }}
    </label>
    <p class="mt-3 text-sm font-bold text-ink tabular">{{ totalLabel }}</p>
  </div>
</template>

<script setup>
import { watch } from 'vue'

const props = defineProps({
  fields: { type: Array, required: true }, // [{ key, label, step? }]
  values: { type: Object, required: true }, // { key: number | null }
  shared: { type: Boolean, default: false },
  sharedLabel: { type: String, default: '' },
  note: { type: String, default: '' },
  totalLabel: { type: String, default: '' },
})
const emit = defineEmits(['update:values', 'update:shared'])

// Keep a local mirror so that several inputs in the same tick (autofill,
// scripted entry) accumulate instead of overwriting each other while the
// parent's prop has not caught up yet.
let local = { ...props.values }
watch(() => props.values, (v) => { local = { ...v } })

function onInput(key, e) {
  const raw = e.target.value
  const n = raw === '' ? null : Number(raw)
  local = { ...local, [key]: Number.isFinite(n) ? n : null }
  emit('update:values', local)
}
</script>
