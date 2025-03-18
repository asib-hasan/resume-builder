<script>
import useVuelidate from '@vuelidate/core'
import { required, email, minLength, numeric } from '@vuelidate/validators'
import { ref } from 'vue'

export default {
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
                    <!--<div class="d-flex justify-content-center mb-2">
                                                <a href=""><img src="" style="height: 80px" alt="logo"></a>
                                            </div>-->
                    <div class="d-flex justify-content-center">
                      <a href="" class="logo d-flex align-items-center w-auto"
                        ><span>My Profile</span></a
                      >
                    </div>
                  </div>
                  <form class="row g-3" method="GET" action="dashboard.php">
                    <div class="col-12">
                      <div class="form-floating">
                        <input
                          type="text"
                          class="form-control"
                          id="email"
                          name="email"
                          value=""
                          placeholder="Enter User ID"
                          required
                        />
                        <label for="username">Username or Email</label>
                      </div>
                    </div>
                    <div class="col-12">
                      <div class="form-floating">
                        <input
                          type="password"
                          class="form-control"
                          id="password"
                          name="password"
                          value=""
                          placeholder="Enter Password"
                          required
                        />
                        <label for="password">Password</label>
                      </div>
                    </div>
                    <div class="col-12">
                      <button
                        class="btn btn-primary w-100"
                        type="submit"
                        style="background: black; border: 1px solid black"
                      >
                        SIGN IN
                      </button>
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
