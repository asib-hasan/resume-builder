<script>
import SideBar from '@/layout/SideBar.vue'
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { ref } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

export default {
  components: {
    SideBar,
    QuillEditor,
  },
  setup() {
    // Form data
    const form = ref({
      first_name: '',
      last_name: '',
      dob: '',
      end_date: '',
      responsibilities: '',
    })

    // Validation rules
    const rules = {
      first_name: { required },
      last_name: { required },
      dob: { required },
      end_date: { required },
      responsibilities: { required },
    }

    const v$ = useVuelidate(rules, form)

    // Form submit
    const submitForm = () => {
      v$.value.$validate()
      if (!v$.value.$error) {
        alert('Form submitted successfully!\nResponsibilities: ' + form.value.responsibilities)
      }
    }

    // Ask AI loading state
    const isLoading = ref(false)

    // Ask AI handler
    const askAI = () => {
      isLoading.value = true

      // Simulate an API call
      setTimeout(() => {
        isLoading.value = false
        alert('AI response: "Here is a suggestion for your responsibilities..."')
      }, 2000)
    }

    return {
      form,
      v$,
      submitForm,
      askAI,
      isLoading,
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
                <input v-model="form.first_name" type="text" class="form-control" />
                <div v-if="v$.first_name.$error" class="text-danger">Job Title required</div>
              </div>

              <div class="col-md-4">
                <label class="form-label">Start Date <span class="required-mask">*</span></label>
                <input v-model="form.dob" type="date" class="form-control" />
                <div v-if="v$.dob.$error" class="text-danger">Start date required</div>
              </div>

              <div class="col-md-4">
                <label class="form-label">End Date <span class="required-mask">*</span></label>
                <input v-model="form.end_date" type="date" class="form-control" />
                <div v-if="v$.end_date.$error" class="text-danger">End date required</div>
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
                <QuillEditor
                  v-model="form.responsibilities"
                  theme="snow"
                  :toolbar="[
                    ['bold', 'italic', 'underline'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['link'],
                  ]"
                  style="height: 250px; background: white"
                />
                <div v-if="v$.responsibilities.$error" class="text-danger">
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
                      class="form-control"
                      rows="5"
                      placeholder="Type your question..."
                    ></textarea>
                  </div>
                  <div class="modal-footer">
                    <button class="btn btn-secondary" data-bs-dismiss="modal" :disabled="isLoading">
                      Close
                    </button>

                    <!-- Ask Button -->
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
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
