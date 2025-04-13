<script>
import SideBar from '@/layout/SideBar.vue'
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import draggable from 'vuedraggable'
import { useToast } from 'vue-toast-notification'

export default {
  components: {
    SideBar,
    draggable,
  },
  setup() {
    const toast = useToast()

    const form = ref({
      job_title: '',
      start_date: '',
      end_date: '',
      responsibilities: '',
    })

    const currentlyWorking = ref(false)
    const aiQuestion = ref('')
    const isLoading = ref(false)
    const editingIndex = ref(null)

    const editForm = ref({
      job_title: '',
      start_date: '',
      end_date: '',
      responsibilities: '',
    })
    const editCurrentlyWorking = ref(false)

    const experiences = ref([])

    const sortKey = ref('')
    const sortOrder = ref('asc')

    // Fetch experiences from API
    const fetchExperiences = async () => {
      try {
        const res = await axios.get('/api/experiences')
        experiences.value = res.data
      } catch (error) {
        toast.error('Failed to load experiences.')
      }
    }

    onMounted(() => {
      fetchExperiences()
    })

    const rules = computed(() => ({
      job_title: { required },
      start_date: { required },
      end_date: currentlyWorking.value ? {} : { required },
      responsibilities: { required },
    }))
    const v$ = useVuelidate(rules, form)

    const submitForm = async () => {
      const isValid = await v$.value.$validate()
      if (!isValid) return

      try {
        const payload = {
          ...form.value,
          end_date: currentlyWorking.value ? null : form.value.end_date,
          currentlyWorking: currentlyWorking.value,
        }

        await axios.post('/api/experiences', payload)
        toast.success('Experience saved!')
        fetchExperiences()
        resetForm()
      } catch (error) {
        toast.error('Failed to save experience.')
      }
    }

    const resetForm = () => {
      form.value = {
        job_title: '',
        start_date: '',
        end_date: '',
        responsibilities: '',
      }
      currentlyWorking.value = false
      editingIndex.value = null
      v$.value.$reset()
    }

    const deleteExperience = async (id) => {
      if (!confirm('Are you sure?')) return
      try {
        await axios.delete(`/api/experiences/${id}`)
        toast.success('Deleted!')
        fetchExperiences()
      } catch (error) {
        toast.error('Failed to delete.')
      }
    }

    const editExperience = (index, id) => {
      const exp = experiences.value[index]
      editForm.value = { ...exp }
      editCurrentlyWorking.value = exp.currentlyWorking
      editingIndex.value = id
      new bootstrap.Modal(document.getElementById('editExperienceModal')).show()
    }

    const updateExperience = async () => {
      if (editingIndex.value === null) return

      try {
        const payload = {
          ...editForm.value,
          end_date: editCurrentlyWorking.value ? null : editForm.value.end_date,
          currentlyWorking: editCurrentlyWorking.value,
        }

        await axios.put(`/api/experiences/${editingIndex.value}`, payload)
        bootstrap.Modal.getInstance(document.getElementById('editExperienceModal')).hide()
        toast.success('Experience updated successfully!')
        fetchExperiences()
      } catch (error) {
        toast.error('Failed to update experience.')
      }
    }

    const askAI = async () => {
      if (!aiQuestion.value.trim()) return alert('Enter a question')
      isLoading.value = true
      try {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content:
                  'You are a helpful assistant that writes professional resume responsibilities.',
              },
              {
                role: 'user',
                content: aiQuestion.value,
              },
            ],
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
            },
          },
        )
        form.value.responsibilities = response.data.choices[0].message.content
        aiQuestion.value = ''
        toast.success('AI generated responsibility!')
      } catch (error) {
        toast.error('Failed to get AI response.')
      } finally {
        isLoading.value = false
      }
    }

    const sortBy = (key) => {
      if (sortKey.value === key) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortKey.value = key
        sortOrder.value = 'asc'
      }
      experiences.value.sort((a, b) => {
        let valA = (a[key] || '').toString().toLowerCase()
        let valB = (b[key] || '').toString().toLowerCase()
        if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
        if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
        return 0
      })
    }

    return {
      form,
      v$,
      submitForm,
      askAI,
      isLoading,
      currentlyWorking,
      aiQuestion,
      experiences,
      deleteExperience,
      editExperience,
      editingIndex,
      editForm,
      editCurrentlyWorking,
      updateExperience,
      sortKey,
      sortOrder,
      sortBy,
    }
  },
}
</script>

<template>
  <SideBar />
  <main id="main" class="main">
    <div class="pagetitle">
      <ol class="breadcrumb">
        <li class="breadcrumb-item active">Home</li>
        <li class="breadcrumb-item"><a href="">My Resume</a></li>
      </ol>
    </div>

    <section class="dashboard">
      <div class="row">
        <div class="col-md-12">
          <ul class="nav nav-tabs nav-tabs-bordered d-flex">
            <li class="nav-item tab-style">
              <router-link to="/resume/profile" class="nav-link font-weight-bold"
                >Personal</router-link
              >
            </li>
            <li class="nav-item">
              <router-link to="/resume/experience" class="nav-link active font-weight-bold"
                >Experience</router-link
              >
            </li>
          </ul>

          <div class="tab-content">
            <form @submit.prevent="submitForm" class="row g-3">
              <div class="col-md-4">
                <label class="form-label">Job Title <span class="required-mask">*</span></label>
                <input v-model="form.job_title" type="text" class="form-control" />
                <div v-if="v$.job_title.$dirty && v$.job_title.$error" class="text-danger">
                  Job Title required
                </div>
              </div>

              <div class="col-md-4">
                <label class="form-label">Start Date <span class="required-mask">*</span></label>
                <input v-model="form.start_date" type="date" class="form-control" />
                <div v-if="v$.start_date.$dirty && v$.start_date.$error" class="text-danger">
                  Start date required
                </div>
              </div>

              <div class="col-md-4">
                <label class="form-label">End Date <span class="required-mask">*</span></label>
                <input
                  v-model="form.end_date"
                  type="date"
                  class="form-control"
                  :disabled="currentlyWorking"
                />
                <div class="form-check mt-2">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="currentlyWorking"
                    v-model="currentlyWorking"
                    @change="form.end_date = currentlyWorking ? '' : form.end_date"
                  />
                  <label class="form-check-label" for="currentlyWorking">
                    <small>Currently Working</small>
                  </label>
                </div>
                <div v-if="v$.end_date?.$dirty && v$.end_date?.$error" class="text-danger">
                  End date required
                </div>
              </div>

              <div class="col-md-12">
                <a class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#aiModal">
                  <i class="bi bi-cpu"></i> Ask AI for Assistance
                </a>
              </div>

              <div class="col-md-12">
                <label class="form-label"
                  >Responsibilities <span class="required-mask">*</span></label
                >
                <textarea
                  v-model="form.responsibilities"
                  class="form-control"
                  rows="5"
                  placeholder="Describe your responsibilities..."
                ></textarea>
                <div
                  v-if="v$.responsibilities.$dirty && v$.responsibilities.$error"
                  class="text-danger"
                >
                  Responsibilities required
                </div>
              </div>

              <div class="col-md-4">
                <button type="submit" class="btn btn-primary">Submit</button>
              </div>
            </form>

            <!-- Ask AI Modal -->
            <div
              class="modal fade"
              id="aiModal"
              tabindex="-1"
              aria-labelledby="aiModalLabel"
              aria-hidden="true"
            >
              <div class="modal-dialog modal-lg">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="aiModalLabel">AI Assistance</h5>
                    <button
                      type="button"
                      class="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    ></button>
                  </div>
                  <div class="modal-body">
                    <p>How can I help you? Ask me anything related to your responsibilities.</p>
                    <textarea
                      v-model="aiQuestion"
                      class="form-control"
                      rows="4"
                      placeholder="Type your question..."
                    ></textarea>
                  </div>
                  <div class="modal-footer">
                    <button class="btn btn-secondary" data-bs-dismiss="modal" :disabled="isLoading">
                      Close
                    </button>
                    <button class="btn btn-primary" @click="askAI" :disabled="isLoading">
                      <span
                        v-if="isLoading"
                        class="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      <span v-if="!isLoading">Ask</span>
                      <span v-else class="ms-2">Waiting...</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <!-- End Modal -->

            <!-- Experience List -->
            <div class="col-md-12 mt-4">
              <table class="table table-bordered table-sm">
                <thead>
                  <tr>
                    <th @click="sortBy('job_title')" style="cursor: pointer">
                      Job Title
                      <i
                        v-if="sortKey === 'job_title'"
                        :class="sortOrder === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"
                      ></i>
                    </th>
                    <th @click="sortBy('start_date')" style="cursor: pointer">
                      Start Date
                      <i
                        v-if="sortKey === 'start_date'"
                        :class="sortOrder === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"
                      ></i>
                    </th>
                    <th @click="sortBy('end_date')" style="cursor: pointer">
                      End Date
                      <i
                        v-if="sortKey === 'end_date'"
                        :class="sortOrder === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"
                      ></i>
                    </th>
                    <th>Responsibilities</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <draggable v-model="experiences" tag="tbody" item-key="job_title" handle=".handle">
                  <template #item="{ element, index }">
                    <tr>
                      <td class="handle" style="cursor: move">
                        {{ element.job_title }}
                      </td>
                      <td>{{ element.start_date }}</td>
                      <td>
                        {{ element.currentlyWorking ? 'Currently Working' : element.end_date }}
                      </td>
                      <td>{{ element.responsibilities }}</td>
                      <td>
                        <button class="btn btn-sm btn-warning me-1" @click="editExperience(index)">
                          Edit
                        </button>
                        <button class="btn btn-sm btn-danger" @click="deleteExperience(index)">
                          Delete
                        </button>
                      </td>
                    </tr>
                  </template>
                </draggable>
              </table>
            </div>
            <!-- End Experience List -->

            <!-- Edit Experience Modal -->
            <div
              class="modal fade"
              id="editExperienceModal"
              tabindex="-1"
              aria-labelledby="editExperienceModalLabel"
              aria-hidden="true"
            >
              <div class="modal-dialog modal-lg">
                <div class="modal-content">
                  <form @submit.prevent="updateExperience">
                    <div class="modal-header">
                      <h5 class="modal-title" id="editExperienceModalLabel">Edit Experience</h5>
                      <button
                        type="button"
                        class="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      />
                    </div>
                    <div class="modal-body row g-3">
                      <div class="col-md-4">
                        <label class="form-label">Job Title</label>
                        <input v-model="editForm.job_title" type="text" class="form-control" />
                      </div>

                      <div class="col-md-4">
                        <label class="form-label">Start Date</label>
                        <input v-model="editForm.start_date" type="date" class="form-control" />
                      </div>

                      <div class="col-md-4">
                        <label class="form-label">End Date</label>
                        <input
                          v-model="editForm.end_date"
                          type="date"
                          class="form-control"
                          :disabled="editCurrentlyWorking"
                        />
                        <div class="form-check mt-2">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            id="editCurrentlyWorking"
                            v-model="editCurrentlyWorking"
                            @change="
                              editForm.end_date = editCurrentlyWorking ? '' : editForm.end_date
                            "
                          />
                          <label class="form-check-label" for="editCurrentlyWorking">
                            <small>Currently Working</small>
                          </label>
                        </div>
                      </div>

                      <div class="col-md-12">
                        <label class="form-label">Responsibilities</label>
                        <textarea
                          v-model="editForm.responsibilities"
                          class="form-control"
                          rows="5"
                        ></textarea>
                      </div>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        Cancel
                      </button>
                      <button type="submit" class="btn btn-primary">Update</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <!-- End Edit Experience Modal -->
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
