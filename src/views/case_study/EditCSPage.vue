<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SideBar from '@/layout/SideBar.vue'
import CustomEditor from '@/components/CustomEditor.vue'
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { useToast } from 'vue-toast-notification'
import { baseImageURL } from '@/config'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const primaryID = route.params.id
const toast = useToast()
const token = localStorage.getItem('token')
const previewImage = ref(null)
const formFields = ref({
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

const v$ = useVuelidate(rules, formFields)

const handleFileChange = (e) => {
  const file = e.target.files[0]
  formFields.value.image = file
  if (file) {
    previewImage.value = URL.createObjectURL(file)
  }
}

const getData = async () => {
  try {
    const response = await axios.get(`http://127.0.0.1:8000/api/single/cs/${primaryID}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const data = response.data.data
    formFields.value.title = data.title
    formFields.value.category = data.category
    formFields.value.date = data.date
    formFields.value.description = data.description
    if (data.image) {
      previewImage.value = `${baseImageURL}/${data.image}`
    }
  } catch (error) {
    toast.error('Failed to fetch case study data.')
    console.error(error)
  }
}

const updateData = async () => {
  v$.value.$validate()
  if (!v$.value.$error) {
    const formData = new FormData()
    formData.append('title', formFields.value.title)
    formData.append('category', formFields.value.category)
    formData.append('date', formFields.value.date)
    formData.append('description', formFields.value.description)
    if (formFields.value.image) {
      formData.append('image', formFields.value.image)
    }
    console.log('Form Data:', formData)
    formData.append('_method', 'PUT')

    try {
      const response = await axios.post(`http://127.0.0.1:8000/api/cs/${primaryID}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.status === 200) {
        toast.success('Case Study updated successfully!')
        router.push('/case/study/list')
      } else {
        toast.error('Failed to update case study.')
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
}

// Modal open function
const openImageModal = () => {
  window.bootstrap.Modal.getOrCreateInstance(document.getElementById('imageModal')).show()
}

onMounted(() => {
  getData(), document.getElementById('case-study').classList.add('nav-active')
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
            <li class="nav-item tab-style">
              <router-link to="/case/study/list" class="nav-link font-weight-bold"
                >List</router-link
              >
            </li>
            <li class="nav-item">
              <a href="#" class="nav-link active font-weight-bold">Edit Case Study</a>
            </li>
          </ul>

          <!-- Tab Content -->
          <div class="tab-content">
            <form @submit.prevent="updateData" class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Title <span class="required-mask">*</span></label>
                <input
                  v-model="formFields.title"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': v$.title.$dirty && v$.title.$error }"
                />
                <div v-if="v$.title.$error" class="error-msg">Title required</div>
              </div>

              <div class="col-md-6">
                <label class="form-label">Category <span class="required-mask">*</span></label>
                <input
                  v-model="formFields.category"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': v$.category.$dirty && v$.category.$error }"
                />
                <div v-if="v$.category.$error" class="error-msg">Category required</div>
              </div>

              <div class="col-md-6">
                <label class="form-label">Date <span class="required-mask">*</span></label>
                <input
                  v-model="formFields.date"
                  type="date"
                  class="form-control"
                  :class="{ 'is-invalid': v$.date.$dirty && v$.date.$error }"
                />
                <span v-if="v$.date.$error" class="error-msg">Date required</span>
              </div>

              <div class="col-md-6">
                <label class="form-label"
                  >Change Image
                  <a
                    href="#"
                    class="text-danger ai-button"
                    data-bs-toggle="modal"
                    data-bs-target="#aiModal"
                    @click="openImageModal"
                  >
                    <i class="bi bi-image"></i> View Image
                  </a>
                </label>
                <input type="file" @change="handleFileChange" class="form-control" />
              </div>

              <div class="col-md-12">
                <label class="form-label">Description <span class="required-mask">*</span></label>
                <div class="border rounded">
                  <CustomEditor v-model="formFields.description" />
                </div>
                <div v-if="v$.description.$error" class="error-msg mt-1">Description required</div>
              </div>

              <div class="col-md-2">
                <label class="form-label">&nbsp;</label>
                <button type="submit" class="btn btn-primary">Update Blog</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>

    <!-- Image Modal -->
    <div
      class="modal fade"
      id="imageModal"
      tabindex="-1"
      aria-labelledby="imageModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-body p-0">
            <template v-if="previewImage">
              <img :src="previewImage" alt="Preview" class="img-fluid w-100" />
            </template>
            <template v-else>
              <div class="text-center p-5">
                <p class="text-muted font-weight-bold">No Image Found</p>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
