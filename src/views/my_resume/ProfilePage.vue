<script setup>
import SideBar from '@/layout/SideBar.vue'
import CustomEditor from '@/components/CustomEditor.vue'
import { onMounted } from 'vue'
import axios from 'axios'
import useVuelidate from '@vuelidate/core'
import { required, email, minLength } from '@vuelidate/validators'
import { ref } from 'vue'
import { useToast } from 'vue-toast-notification'
import { baseURL } from '@/config'

const token = localStorage.getItem('token')
const toast = useToast()

const form = ref({
  first_name: '',
  last_name: '',
  gender: '',
  dob: '',
  marital_status: '',
  profession: '',
  address: '',
  phone: '',
  email: '',
  summary: '',
})

const rules = {
  first_name: { required },
  last_name: { required },
  gender: { required },
  dob: { required },
  marital_status: { required },
  profession: { required },
  address: { required },
  phone: { required, minLength: minLength(10) },
  email: { required, email },
  summary: { required },
}
const v$ = useVuelidate(rules, form)

const aiQuestion = ref('')
const isLoading = ref(false)

const askAI = async () => {
  const question = aiQuestion.value.trim()
  if (!question) {
    toast.error('Please enter a question before asking AI')
    return
  }

  isLoading.value = true
  try {
    const response = await axios.get(`${baseURL}/api/ask/openai`, {
      params: {
        question: question, // or just "question" if variable name is same
      },
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    form.value.summary = response.data.message
    console.log(response.data)
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
  } finally {
    isLoading.value = false
  }
}

const getData = async () => {
  try {
    const response = await axios.get(`${baseURL}/api/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = response.data.data
    form.value.first_name = data.first_name
    form.value.last_name = data.last_name
    form.value.address = data.address
    form.value.phone = data.phone
    form.value.email = data.email
    form.value.marital_status = data.marital_status
    form.value.profession = data.profession
    form.value.summary = data.summary
    form.value.gender = data.gender
    form.value.dob = data.dob
  } catch (error) {
    console.error(error)
  }
}

const submitForm = async () => {
  v$.value.$validate()
  if (!v$.value.$error) {
    try {
      await axios.post('http://127.0.0.1:8000/api/profile', form.value, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      toast.success('Profile updated successfully')
      getData()
    } catch (error) {
      console.error(error)
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
}
onMounted(() => {
  document.getElementById('my-resume').classList.add('nav-active')
  getData()
})
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
            <li class="nav-item">
              <router-link to="/resume/profile" class="nav-link active font-weight-bold"
                >Personal</router-link
              >
            </li>
            <li class="nav-item tab-style">
              <router-link to="/resume/experiences" class="nav-link font-weight-bold"
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
                <label class="form-label">First Name <span class="required-mask">*</span></label>
                <input
                  v-model="form.first_name"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': v$.first_name.$dirty && v$.first_name.$error }"
                />
                <div v-if="v$.first_name.$error" class="error-msg">First name required</div>
              </div>

              <div class="col-md-4">
                <label class="form-label">Last Name <span class="required-mask">*</span></label>
                <input
                  v-model="form.last_name"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': v$.last_name.$dirty && v$.last_name.$error }"
                />
                <div v-if="v$.last_name.$error" class="error-msg">Last name required</div>
              </div>

              <div class="col-md-4">
                <label class="form-label">Gender <span class="required-mask">*</span></label>
                <select
                  v-model="form.gender"
                  class="form-control"
                  :class="{ 'is-invalid': v$.gender.$dirty && v$.gender.$error }"
                >
                  <option value="">-- Select --</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <div v-if="v$.gender.$error" class="error-msg">Gender required</div>
              </div>

              <div class="col-md-4">
                <label class="form-label">Date of Birth <span class="required-mask">*</span></label>
                <input
                  v-model="form.dob"
                  type="date"
                  class="form-control"
                  :class="{ 'is-invalid': v$.dob.$dirty && v$.dob.$error }"
                />
                <div v-if="v$.dob.$error" class="error-msg">Date of Birth required</div>
              </div>

              <div class="col-md-4">
                <label class="form-label"
                  >Marital Status <span class="required-mask">*</span></label
                >
                <select
                  v-model="form.marital_status"
                  class="form-control"
                  :class="{ 'is-invalid': v$.marital_status.$dirty && v$.marital_status.$error }"
                >
                  <option value="">-- Select --</option>
                  <option value="1">Single</option>
                  <option value="2">Married</option>
                  <option value="3">Divorced</option>
                </select>
                <div v-if="v$.marital_status.$error" class="error-msg">Marital status required</div>
              </div>

              <div class="col-md-4">
                <label class="form-label">Profession <span class="required-mask">*</span></label>
                <input
                  v-model="form.profession"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': v$.profession.$dirty && v$.profession.$error }"
                  placeholder="eg. Professor"
                />
                <div v-if="v$.profession.$error" class="error-msg">Profession required</div>
              </div>

              <div class="col-md-4">
                <label class="form-label">Address <span class="required-mask">*</span></label>
                <input
                  v-model="form.address"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': v$.address.$dirty && v$.address.$error }"
                />
                <div v-if="v$.address.$error" class="error-msg">Address required</div>
              </div>

              <div class="col-md-4">
                <label class="form-label">Phone <span class="required-mask">*</span></label>
                <input
                  v-model="form.phone"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': v$.phone.$dirty && v$.phone.$error }"
                />
                <div v-if="v$.phone.$error" class="error-msg">Phone must be at least 10 digits</div>
              </div>

              <div class="col-md-4">
                <label class="form-label">Email <span class="required-mask">*</span></label>
                <input
                  v-model="form.email"
                  type="email"
                  class="form-control"
                  :class="{ 'is-invalid': v$.email.$dirty && v$.email.$error }"
                />
                <div v-if="v$.email.$error" class="error-msg">Valid email required</div>
              </div>

              <div class="col-md-12">
                <label class="form-label"
                  >Summary <span class="required-mask">*</span>
                  <a
                    href="#"
                    class="text-danger ai-button"
                    data-bs-toggle="modal"
                    data-bs-target="#aiModal"
                  >
                    <i class="bi bi-cpu"></i> Ask AI
                  </a>
                </label>
                <div
                  class="border rounded"
                  :class="{ 'is-invalid': v$.summary.$dirty && v$.summary.$error }"
                >
                  <CustomEditor v-model="form.summary" />
                </div>
                <div v-if="v$.summary.$error" class="error-msg mt-1">Summary required</div>
              </div>

              <div class="col-md-1">
                <label class="form-label">&nbsp;</label>
                <button type="submit" class="btn btn-primary w-100">Save</button>
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
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
