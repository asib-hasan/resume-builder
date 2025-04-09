<script>
import SideBar from '@/layout/SideBar.vue'
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { ref, computed } from 'vue'
import axios from 'axios'

export default {
  components: {
    SideBar,
  },
  setup() {
    const form = ref({
      job_title: '',
      start_date: '',
      end_date: '',
      responsibilities: '',
    })

    const currentlyWorking = ref(false)
    const aiQuestion = ref('')
    const isLoading = ref(false)
    const experiences = ref([
      {
        job_title: 'Software Developer',
        start_date: '2022-01-01',
        end_date: '2023-12-31',
        responsibilities: 'Developed web applications and managed backend services.',
        currentlyWorking: false,
      },
      {
        job_title: 'Frontend Developer',
        start_date: '2021-05-01',
        end_date: '2022-01-01',
        responsibilities: 'Built responsive UI components and collaborated with UX team.',
        currentlyWorking: false,
      },
      {
        job_title: 'Junior Developer',
        start_date: '2020-06-01',
        end_date: '',
        responsibilities: 'Assisted in coding, debugging, and testing various projects.',
        currentlyWorking: true,
      },
    ])
    const editingIndex = ref(null) // To track if we're editing

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

      const experience = { ...form.value, currentlyWorking: currentlyWorking.value }

      if (editingIndex.value !== null) {
        experiences.value[editingIndex.value] = experience
        editingIndex.value = null
      } else {
        experiences.value.push(experience)
      }

      alert('Experience saved!')
      resetForm()
    }

    const editExperience = (index) => {
      const exp = experiences.value[index]
      form.value = { ...exp }
      currentlyWorking.value = exp.currentlyWorking
      editingIndex.value = index
    }

    const deleteExperience = (index) => {
      if (confirm('Are you sure you want to delete this experience?')) {
        experiences.value.splice(index, 1)
        resetForm()
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
      v$.value.$reset()
    }

    const askAI = async () => {
      if (!aiQuestion.value.trim()) {
        alert('Please enter a question.')
        return
      }

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

        const reply = response.data.choices[0].message.content
        form.value.responsibilities = reply
        aiQuestion.value = ''
        alert('AI Response:\n' + reply)
      } catch (error) {
        console.error(error)
        alert(error)
      } finally {
        isLoading.value = false
      }
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
      editExperience,
      deleteExperience,
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
              <table class="table table-bordered table-hover table-sm">
                <thead>
                  <tr>
                    <th colspan="5">My Experiences</th>
                  </tr>
                  <tr>
                    <th>Job Title</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Responsibilities</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(exp, index) in experiences" :key="index">
                    <td>{{ exp.job_title }}</td>
                    <td>{{ exp.start_date }}</td>
                    <td>{{ exp.currentlyWorking ? 'Currently Working' : exp.end_date }}</td>
                    <td>{{ exp.responsibilities }}</td>
                    <td>
                      <a href="#" @click="editExperience(index)">
                        <i class="bi bi-pencil"></i> Edit
                      </a>
                      <button class="btn btn-sm btn-danger" @click="deleteExperience(index)">
                        Delete
                      </button>
                    </td>
                  </tr>
                  <tr v-if="experiences.length === 0">
                    <td colspan="5">No experience added yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- End Experience List -->
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
