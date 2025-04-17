<script setup>
import { onMounted, ref, watch } from 'vue'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

// Emits
const emit = defineEmits(['update:modelValue'])

const editorRef = ref(null)
let quill = null

onMounted(() => {
  quill = new Quill(editorRef.value, {
    theme: 'snow',
    placeholder: 'Write a brief summary...',
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link'],
        ['clean'],
      ],
    },
  })

  quill.root.innerHTML = props.modelValue || ''

  quill.on('text-change', () => {
    emit('update:modelValue', quill.root.innerHTML)
  })
})

// Keep v-model reactive if parent changes it manually
watch(
  () => props.modelValue,
  (newValue) => {
    if (quill && quill.root.innerHTML !== newValue) {
      quill.root.innerHTML = newValue || ''
    }
  },
)
</script>

<template>
  <div>
    <div ref="editorRef" class="quill-editor"></div>
  </div>
</template>

<style scoped>
.quill-editor {
  min-height: 150px;
}
</style>
