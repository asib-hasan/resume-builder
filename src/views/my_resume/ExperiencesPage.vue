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
    const token = localStorage.getItem('token')
    const toast = useToast()

    const form = ref({
      job_title: '',
      company_name: '',
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
      company_name: '',
      start_date: '',
      end_date: '',
      responsibilities: '',
    })
    const editCurrentlyWorking = ref(false)

    const experiences = ref([])
    const deleteTarget = ref({ id: null })
    const sortKey = ref('')
    const sortOrder = ref('asc')

    const fetchExperiences = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/experiences', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (res.status === 200) {
          var temp_data = res.data
          // Check if temp_data['data'] is an array, if not convert it
          experiences.value = Array.isArray(temp_data['data'])
            ? temp_data['data']
            : [temp_data['data']]

          console.log('Experiences:', experiences.value)
        } else {
          console.error('Failed to load experiences.')
        }
      } catch (error) {
        console.error('Error loading experiences:', error)
      }
    }

    onMounted(() => {
      document.getElementById('my-resume').classList.add('nav-active')
      fetchExperiences()
    })

    const rules = computed(() => ({
      job_title: { required },
      company_name: { required },
      start_date: { required },
      end_date: currentlyWorking.value ? {} : { required },
      responsibilities: { required },
    }))
    const v$ = useVuelidate(rules, form)

    const submitForm = async () => {
      const isValid = await v$.value.$validate()
      if (!isValid) {
        toast.error('Please fill out the form correctly.')
        return
      }

      try {
        const payload = {
          ...form.value,
          end_date: currentlyWorking.value ? null : form.value.end_date,
          currentlyWorking: currentlyWorking.value,
        }

        const response = await axios.post('http://127.0.0.1:8000/api/experiences', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.status === 201) {
          toast.success('Experience saved!')
          fetchExperiences()
          resetForm()
        } else {
          toast.error('Failed to save experience.')
        }
      } catch (error) {
        if (error.response && error.response.status === 422) {
          const errors = error.response.data.errors
          for (const key in errors) {
            toast.error(errors[key][0])
          }
        } else {
          toast.error('Server error occurred.')
          console.error(error)
        }
      }
    }

    const resetForm = () => {
      form.value = {
        job_title: '',
        company_name: '',
        start_date: '',
        end_date: '',
        responsibilities: '',
      }
      currentlyWorking.value = false
      editingIndex.value = null
      v$.value.$reset()
    }

    const editExperience = (experience) => {
      editForm.value = { ...experience }
      editCurrentlyWorking.value = experience.currentlyWorking
      editingIndex.value = experience.id
      window.bootstrap.Modal.getOrCreateInstance(
        document.getElementById('editExperienceModal'),
      ).show()
    }

    const updateExperience = async () => {
      if (editingIndex.value === null) return

      try {
        const payload = {
          ...editForm.value,
          end_date: editCurrentlyWorking.value ? null : editForm.value.end_date,
          currentlyWorking: editCurrentlyWorking.value,
        }

        const response = await axios.put(
          `http://127.0.0.1:8000/api/experiences/${editingIndex.value}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (response.status === 200) {
          toast.success('Experience updated successfully!')
          fetchExperiences()
          window.bootstrap.Modal.getInstance(document.getElementById('editExperienceModal')).hide()
        } else {
          toast.error('Failed to update experience.')
        }
      } catch (error) {
        if (error.response && error.response.status === 422) {
          const errors = error.response.data.errors
          for (const key in errors) {
            toast.error(errors[key][0])
          }
        } else if (error.response && error.response.status === 404) {
          toast.error('Experience not found.')
        } else {
          toast.error('Server error occurred.')
          console.error(error)
        }
      }
    }

    const confirmDelete = (item) => {
      deleteTarget.value = { id: item.id, details: item.details }
      window.bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteModal')).show()
    }

    const performDelete = async () => {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/experiences/${deleteTarget.value.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success('Experience deleted!')
        fetchExperiences()
      } catch {
        toast.error('Delete failed.')
      } finally {
        window.bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide()
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
      } catch {
        toast.error('Failed to get AI response.')
      } finally {
        isLoading.value = false
      }
    }

    const sortBy = (key) => {
      // Toggle sorting order or set to ascending if new key is chosen
      if (sortKey.value === key) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortKey.value = key
        sortOrder.value = 'asc'
      }

      // Sort the experiences based on the selected key and order
      experiences.value.sort((a, b) => {
        let valA = (a[key] || '').toString().toLowerCase()
        let valB = (b[key] || '').toString().toLowerCase()
        if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
        if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
        return 0
      })
    }

    // Method to update the sort order in the backend
    const onSortEnd = async () => {
      try {
        const updatedExperiences = experiences.value.map((experience, index) => ({
          ...experience,
          sort_order: index + 1,
        }))

        try {
          const response = await axios.post(
            'http://127.0.0.1:8000/api/update/experience/order',
            { experiences: updatedExperiences },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          )
          if (response.status == 200) {
            toast.success('Sort order updated successfully!')
          } else {
            toast.error('Failed to update sort order.')
          }
        } catch (error) {
          console.error('Error updating sort order:', error)
        }
        toast.success('Sort order updated successfully!')
      } catch (error) {
        toast.error('Failed to update sort order.')
        console.error(error)
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
      editingIndex,
      editForm,
      editCurrentlyWorking,
      updateExperience,
      sortKey,
      sortOrder,
      sortBy,
      onSortEnd,
      confirmDelete,
      performDelete,
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
              <router-link to="/resume/experiences" class="nav-link active font-weight-bold"
                >Experience</router-link
              >
            </li>
            <li class="nav-item tab-style">
              <router-link to="/resume/educations" class="nav-link font-weight-bold"
                >Education</router-link
              >
            </li>
            <li class="nav-item tab-style">
              <router-link to="/resume/skills" class="nav-link font-weight-bold"
                >Skills</router-link
              >
            </li>
            <li class="nav-item tab-style">
              <router-link to="/resume/interests" class="nav-link font-weight-bold"
                >Interest</router-link
              >
            </li>
            <li class="nav-item tab-style">
              <router-link to="/resume/publications" class="nav-link font-weight-bold"
                >Publications</router-link
              >
            </li>
            <li class="nav-item tab-style">
              <router-link to="/resume/languages" class="nav-link font-weight-bold"
                >Language</router-link
              >
            </li>
            <li class="nav-item tab-style">
              <router-link to="/resume/certifications" class="nav-link font-weight-bold"
                >Certifications</router-link
              >
            </li>
            <li class="nav-item tab-style">
              <router-link to="/resume/awards" class="nav-link font-weight-bold"
                >Awards & Honors</router-link
              >
            </li>
          </ul>

          <div class="tab-content">
            <form @submit.prevent="submitForm" class="row g-3">
              <div class="col-md-4">
                <label class="form-label">Job Title <span class="required-mask">*</span></label>
                <input
                  v-model="form.job_title"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': v$.job_title.$dirty && v$.job_title.$error }"
                />
                <div v-if="v$.job_title.$error" class="error-msg">Job title required</div>
              </div>
              <div class="col-md-4">
                <label class="form-label">Company Name <span class="required-mask">*</span></label>
                <input
                  v-model="form.company_name"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': v$.company_name.$dirty && v$.company_name.$error }"
                />
                <div v-if="v$.company_name.$error" class="error-msg">Company name required</div>
              </div>

              <div class="col-md-4">
                <label class="form-label">Start Date <span class="required-mask">*</span></label>
                <input
                  v-model="form.start_date"
                  type="date"
                  class="form-control"
                  :class="{ 'is-invalid': v$.start_date.$dirty && v$.start_date.$error }"
                />
                <div v-if="v$.start_date.$error" class="error-msg">Start date required</div>
              </div>

              <div class="col-md-4">
                <label class="form-label">End Date <span class="required-mask">*</span></label>
                <input
                  v-model="form.end_date"
                  type="date"
                  class="form-control"
                  :class="{ 'is-invalid': v$.end_date?.$dirty && v$.end_date?.$error }"
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
                <div v-if="v$.end_date?.$error" class="error-msg">End date required</div>
              </div>

              <div class="col-md-12">
                <label class="form-label"
                  >Responsibilities <span class="required-mask">*</span>
                  <a
                    href="#"
                    class="text-danger ai-button"
                    data-bs-toggle="modal"
                    data-bs-target="#aiModal"
                  >
                    <i class="bi bi-cpu"></i> Ask AI
                  </a>
                </label>
                <textarea
                  v-model="form.responsibilities"
                  class="form-control"
                  rows="5"
                  :class="{
                    'is-invalid': v$.responsibilities.$dirty && v$.responsibilities.$error,
                  }"
                  placeholder="Describe your responsibilities..."
                ></textarea>
                <div v-if="v$.responsibilities.$error" class="error-msg">
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
                    <th
                      class="table-td-width-25"
                      @click="sortBy('job_title')"
                      style="cursor: pointer"
                    >
                      Job Title
                      <i
                        v-if="sortKey === 'job_title'"
                        :class="sortOrder === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"
                      ></i>
                    </th>
                    <th
                      class="table-td-width-15"
                      @click="sortBy('company_name')"
                      style="cursor: pointer"
                    >
                      Company Name
                      <i
                        v-if="sortKey === 'company_name'"
                        :class="sortOrder === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"
                      ></i>
                    </th>
                    <th
                      class="table-td-width-10"
                      @click="sortBy('start_date')"
                      style="cursor: pointer"
                    >
                      Start Date
                      <i
                        v-if="sortKey === 'start_date'"
                        :class="sortOrder === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"
                      ></i>
                    </th>
                    <th
                      class="table-td-width-10"
                      @click="sortBy('end_date')"
                      style="cursor: pointer"
                    >
                      End Date
                      <i
                        v-if="sortKey === 'end_date'"
                        :class="sortOrder === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"
                      ></i>
                    </th>
                    <th class="table-td-width-40">Responsibilities</th>
                    <th class="table-td-width-10">Actions</th>
                  </tr>
                </thead>

                <draggable
                  v-if="experiences && experiences.length > 0"
                  v-model="experiences"
                  tag="tbody"
                  item-key="id"
                  @end="onSortEnd"
                >
                  <template #item="{ element }">
                    <tr>
                      <td>{{ element.job_title }}</td>
                      <td>{{ element.company_name }}</td>
                      <td>{{ new Date(element.start_date).toLocaleDateString() }}</td>
                      <td>
                        {{
                          element.end_date == null
                            ? 'Currently Working'
                            : new Date(element.end_date).toLocaleDateString()
                        }}
                      </td>
                      <td style="white-space: initial">{{ element.responsibilities }}</td>
                      <td>
                        <a href="#" @click.prevent="editExperience(element)" class="text-primary">
                          <i class="bi bi-pencil"></i> Edit
                        </a>
                        <a href="#" @click.prevent="confirmDelete(element)" class="text-danger">
                          <i class="bi bi-trash"></i> Delete
                        </a>
                      </td>
                    </tr>
                  </template>
                </draggable>

                <tbody v-else>
                  <tr>
                    <td colspan="6">Loading...</td>
                  </tr>
                </tbody>
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
                        <label class="form-label">Company Name</label>
                        <input v-model="editForm.company_name" type="text" class="form-control" />
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
            <!-- Delete Modal -->
            <div
              class="modal fade"
              id="deleteModal"
              tabindex="-1"
              aria-labelledby="confirmDeleteLabel"
              aria-hidden="true"
            >
              <div class="modal-dialog" style="max-width: 400px">
                <div class="modal-content">
                  <div class="modal-body">
                    <div class="row mt-3">
                      <div class="col-md-12 text-center circle">
                        <i
                          class="bi bi-exclamation-triangle-fill text-danger"
                          style="border-radius: 50%; padding: 4px; background-color: #facdcd"
                        ></i>
                      </div>
                      <div class="col-md-12 text-center mt-3">
                        <h5 class="font-weight-bold">Are you sure?</h5>
                      </div>
                      <div class="col-md-12 text-center text-muted">
                        <p>
                          This action cannot be undone. All values associated this field will be
                          lost
                        </p>
                      </div>
                      <div class="col-md-12 text-center">
                        <button type="button" class="btn btn-danger w-100" @click="performDelete">
                          Delete Field
                        </button>
                      </div>
                      <div class="col-md-12 text-center mt-2">
                        <button
                          type="button"
                          class="btn btn-secondary w-100"
                          data-bs-dismiss="modal"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- End Delete Modal -->
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
