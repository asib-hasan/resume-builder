<script>
import { ref } from 'vue'
import axios from 'axios'
import useVuelidate from '@vuelidate/core'
import { required, email } from '@vuelidate/validators'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const router = useRouter()

    // Form Data
    const form = ref({
      email: '',
      password: '',
    })

    // Validation Rules
    const rules = {
      email: { required, email },
      password: { required },
    }

    // Vuelidate Instance
    const v$ = useVuelidate(rules, form)

    // Error Message
    const errorMessage = ref(null)

    // Form Submission
    const submitForm = async () => {
      v$.value.$validate() // Trigger validation
      if (v$.value.$error) return // Stop if validation fails

      try {
        const response = await axios.post('http://localhost/resume-builder/api/login', {
          email: form.value.email,
          password: form.value.password,
        })

        localStorage.setItem('token', response.data.token) // Store JWT token
        errorMessage.value = null // Clear errors
        router.push('/dashboard') // Redirect on success
      } catch (error) {
        alert(error)
        errorMessage.value = error.response?.data?.error || 'Login failed'
      }
    }

    return { form, v$, submitForm, errorMessage }
  },
}
</script>

<template>
  <main>
    <div class="container">
      <section class="min-vh-50 d-flex flex-column align-items-center justify-content-center py-4">
        <div class="container">
          <div class="row justify-content-center">
            <div
              class="col-lg-4 col-md-6 d-flex flex-column align-items-center justify-content-center"
            >
              <div class="card mb-3">
                <div class="card-body">
                  <div class="mt-4 mb-4">
                    <div class="d-flex justify-content-center">
                      <a href="" class="logo d-flex align-items-center w-auto"
                        ><span>My Profile</span></a
                      >
                    </div>
                  </div>

                  <form class="row g-3" @submit.prevent="submitForm">
                    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

                    <div class="col-12">
                      <div class="form-floating">
                        <input
                          type="email"
                          class="form-control"
                          v-model="form.email"
                          placeholder="Enter User ID"
                        />
                        <label for="email">Email</label>
                        <small v-if="v$.email.$error" class="text-danger">Invalid email</small>
                      </div>
                    </div>

                    <div class="col-12">
                      <div class="form-floating">
                        <input
                          type="password"
                          class="form-control"
                          v-model="form.password"
                          placeholder="Enter Password"
                        />
                        <label for="password">Password</label>
                        <small v-if="v$.password.$error" class="text-danger"
                          >Password is required</small
                        >
                      </div>
                    </div>

                    <div class="col-12">
                      <button class="btn btn-primary w-100" type="submit">SIGN IN</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>
