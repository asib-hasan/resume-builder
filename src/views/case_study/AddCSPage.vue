<script setup>
import SideBar from '@/layout/SideBar.vue'
import CustomEditor from '@/components/CustomEditor.vue'
import { onMounted, ref } from 'vue'
import axios from 'axios'
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { useToast } from 'vue-toast-notification'

const FormFields = ref({
  title: '',
  category: '',
  date: '',
  image: null,
  description: '',
})

const rules = {
  title: { required },
  category: { required },
  date: { required },
  description: { required },
}

const v$ = useVuelidate(rules, FormFields)
const toast = useToast()
const token = localStorage.getItem('token')

const handleFileChange = (e) => {
  FormFields.value.image = e.target.files[0]
}

const submit = async () => {
  v$.value.$validate()
  if (!v$.value.$error) {
    const formData = new FormData()
    formData.append('title', FormFields.value.title)
    formData.append('category', FormFields.value.category)
    formData.append('date', FormFields.value.date)
    formData.append('description', FormFields.value.description)
    if (FormFields.value.image) {
      formData.append('image', FormFields.value.image)
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/cs', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      if (response.status == 201) {
        toast.success('Case Study posted successfully!')
        FormFields.value = {
          title: '',
          category: '',
          date: '',
          image: null,
          description: '',
        }
        v$.value.$reset()
      } else {
        toast.error('Failed to post case study.')
      }
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
  document.getElementById('case-study').classList.add('nav-active')
})
</script>

<template>
  <SideBar />
  <main id="main" class="main">
    <div class="pagetitle">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><a href="#">Home</a></li>
        <li class="breadcrumb-item active">Case Study</li>
      </ol>
    </div>

    <section class="dashboard">
      <div class="row">
        <div class="col-md-12">
          <ul class="nav nav-tabs nav-tabs-bordered d-flex">
            <li class="nav-item">
              <a href="#" class="nav-link active font-weight-bold">Create Case Study</a>
            </li>
            <li class="nav-item tab-style">
              <router-link to="/case/study/list" class="nav-link font-weight-bold"
                >List</router-link
              >
            </li>
          </ul>

          <!-- Tab Content -->
          <div class="tab-content">
            <form @submit.prevent="submit" class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Title <span class="required-mask">*</span></label>
                <input
                  v-model="FormFields.title"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': v$.title.$dirty && v$.title.$error }"
                />
                <div v-if="v$.title.$error" class="error-msg">Title required</div>
              </div>

              <div class="col-md-6">
                <label class="form-label">Category <span class="required-mask">*</span></label>
                <input
                  v-model="FormFields.category"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': v$.category.$dirty && v$.category.$error }"
                />
                <div v-if="v$.category.$error" class="error-msg">Category required</div>
              </div>

              <div class="col-md-6">
                <label class="form-label">Date <span class="required-mask">*</span></label>
                <input
                  v-model="FormFields.date"
                  type="date"
                  class="form-control"
                  :class="{ 'is-invalid': v$.date.$dirty && v$.date.$error }"
                />
                <span v-if="v$.date.$error" class="error-msg">Date required</span>
              </div>

              <div class="col-md-6">
                <label class="form-label">Image</label>
                <input type="file" @change="handleFileChange" class="form-control" />
              </div>

              <div class="col-md-12">
                <label class="form-label">Description <span class="required-mask">*</span></label>
                <div class="border rounded">
                  <CustomEditor v-model="FormFields.description" />
                </div>
                <div v-if="v$.description.$error" class="error-msg mt-1">Description required</div>
              </div>

              <div class="col-md-2">
                <label class="form-label">&nbsp;</label>
                <button type="submit" class="btn btn-primary">Post Case Study</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
