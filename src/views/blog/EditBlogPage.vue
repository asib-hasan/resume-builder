<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SideBar from '@/layout/SideBar.vue'
import CustomEditor from '@/components/CustomEditor.vue'
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { useToast } from 'vue-toast-notification'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const blogId = route.params.id
const toast = useToast()
const token = localStorage.getItem('token')

const blogForm = ref({
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

const v$ = useVuelidate(rules, blogForm)

const handleFileChange = (e) => {
  blogForm.value.image = e.target.files[0]
}

const getBlogData = async () => {
  try {
    const response = await axios.get(`http://127.0.0.1:8000/api/single/blog/${blogId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const data = response.data.data
    blogForm.value.title = data.title
    blogForm.value.category = data.category
    blogForm.value.date = data.date
    blogForm.value.description = data.description
  } catch (error) {
    toast.error('Failed to fetch blog data.')
    console.error(error)
  }
}

const updateBlog = async () => {
  v$.value.$validate()
  if (!v$.value.$error) {
    const formData = new FormData()
    formData.append('title', blogForm.value.title)
    formData.append('category', blogForm.value.category)
    formData.append('date', blogForm.value.date)
    formData.append('description', blogForm.value.description)
    if (blogForm.value.image) {
      formData.append('image', blogForm.value.image)
    }
    formData.append('_method', 'PUT')

    try {
      const response = await axios.post(`http://127.0.0.1:8000/api/blogs/${blogId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.status === 200) {
        toast.success('Blog updated successfully!')
        router.push('/blog/list')
      } else {
        toast.error('Failed to update blog.')
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

onMounted(() => {
  getBlogData()
})
</script>

<template>
  <SideBar />
  <main id="main" class="main">
    <div class="pagetitle">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><a href="#">Home</a></li>
        <li class="breadcrumb-item active">Blog</li>
      </ol>
    </div>

    <section class="dashboard">
      <div class="row">
        <div class="col-md-12">
          <ul class="nav nav-tabs nav-tabs-bordered d-flex">
            <li class="nav-item tab-style">
              <router-link to="/blog/list" class="nav-link font-weight-bold">List</router-link>
            </li>
            <li class="nav-item">
              <a href="#" class="nav-link active font-weight-bold">Edit Blog</a>
            </li>
          </ul>

          <!-- Tab Content -->
          <div class="tab-content">
            <form @submit.prevent="updateBlog" class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Title <span class="required-mask">*</span></label>
                <input
                  v-model="blogForm.title"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': v$.title.$dirty && v$.title.$error }"
                />
                <div v-if="v$.title.$error" class="error-msg">Title required</div>
              </div>

              <div class="col-md-6">
                <label class="form-label">Category <span class="required-mask">*</span></label>
                <input
                  v-model="blogForm.category"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': v$.category.$dirty && v$.category.$error }"
                />
                <div v-if="v$.category.$error" class="error-msg">Category required</div>
              </div>

              <div class="col-md-6">
                <label class="form-label">Date <span class="required-mask">*</span></label>
                <input
                  v-model="blogForm.date"
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
                  <CustomEditor v-model="blogForm.description" />
                </div>
                <div v-if="v$.description.$error" class="error-msg mt-1">Description required</div>
              </div>

              <div class="col-md-2">
                <label class="form-label">&nbsp;</label>
                <button type="submit" class="btn btn-primary">Post Blog</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
