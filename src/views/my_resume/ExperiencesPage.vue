<script>
import SideBar from '@/layout/SideBar.vue'
import useVuelidate from '@vuelidate/core'
import { required, email, minLength, numeric } from '@vuelidate/validators'
import { ref } from 'vue'

export default {
  components: { SideBar },
  setup() {
    // Form Data
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
    })

    // Validation Rules
    const rules = {
      first_name: { required },
      last_name: { required },
      gender: { required },
      dob: { required },
      marital_status: { required },
      profession: { required },
      address: { required },
      phone: { required, numeric, minLength: minLength(10) },
      email: { required, email },
    }

    // Vuelidate Instance
    const v$ = useVuelidate(rules, form)

    // Form Submission
    const submitForm = () => {
      v$.value.$validate() // Trigger validation
      if (!v$.value.$error) {
        alert('Form submitted successfully!')
        // Proceed with form submission logic
      }
    }

    return { form, v$, submitForm }
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
              <a href="#" class="nav-link font-weight-bold">Personal</a>
            </li>
            <li class="nav-item">
              <a href="#" class="nav-link active font-weight-bold">Experience</a>
            </li>
            <li class="nav-item tab-style">
              <a href="#" class="nav-link font-weight-bold">Tab Three</a>
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
                <label class="form-label">Address <span class="required-mask">*</span></label>
                <input v-model="form.last_name" type="text" class="form-control" />
                <div v-if="v$.last_name.$error" class="text-danger">Address required</div>
              </div>

              <div class="col-md-4">
                <label class="form-label">Start Date <span class="required-mask">*</span></label>
                <input v-model="form.dob" type="date" class="form-control" />
                <div v-if="v$.dob.$error" class="text-danger">Start date required</div>
              </div>

              <div class="col-md-4">
                <label class="form-label">End Date <span class="required-mask">*</span></label>
                <input v-model="form.dob" type="date" class="form-control" />
                <div v-if="v$.dob.$error" class="text-danger">End date required</div>
              </div>

              <div class="col-md-12">
                <button class="btn btn-danger">
                  <i class="bi bi-cpu"></i> Ask AI for Assistance
                </button>
              </div>
              <div class="col-md-4">
                <label class="form-label"
                  >Responsibilities <span class="required-mask">*</span></label
                >
                <textarea v-model="form.phone" type="text" class="form-control" />
                <div v-if="v$.phone.$error" class="text-danger">
                  Phone must be at least 10 digits
                </div>
              </div>

              <div class="col-md-4">
                <label class="form-label">&nbsp;</label>
                <button type="submit" class="btn btn-primary">Submit</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
