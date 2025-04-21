<script setup>
import SideBar from '@/layout/SideBar.vue'
import CustomEditor from '@/components/CustomEditor.vue'
import { ref } from 'vue'
import axios from 'axios'
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { useToast } from 'vue-toast-notification'

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
const toast = useToast()
const token = localStorage.getItem('token')

const handleFileChange = (e) => {
  blogForm.value.image = e.target.files[0]
}

const submitBlog = async () => {
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

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/blogs', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      toast.success('Blog posted successfully!')
      console.log(response.data)
    } catch (error) {
      console.error(error)
      toast.error('Failed to post blog.')
    }
  }
}
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
              <a href="#" class="nav-link font-weight-bold">Create Blog</a>
            </li>
            <li class="nav-item">
              <router-link to="/blogs/list" class="nav-link active font-weight-bold"
                >List</router-link
              >
            </li>
          </ul>

          <div class="tab-content">
            <div class="d-flex justify-content-between mb-3">
              <h5 class="fw-bold">My Blogs</h5>
            </div>

            <div class="table-responsive">
              <table class="table table-bordered table-hover table-sm">
                <thead>
                  <tr>
                    <th class="table-th-width-40">Title</th>
                    <th class="table-th-width-35">Category</th>
                    <th class="table-th-width-10">Date</th>
                    <th class="table-th-width-15">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Welcome to the blog list page. Here you can........</td>
                    <td>Programming</td>
                    <td>22 April, 2024</td>
                    <td>
                      <a href="#"><i class="bi bi-eye"></i> Link </a>
                      <i class="bi bi-pencil"></i> Edit
                      <a href="#" @click.prevent="confirmDelete(item)" class="text-danger">
                        <i class="bi bi-trash"></i> Delete
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

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
                        <p>This action cannot be undone. The blog will be permanently removed.</p>
                      </div>
                      <div class="col-md-12 text-center">
                        <button type="button" class="btn btn-danger w-100" @click="performDelete">
                          Delete Blog
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
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.required-mask {
  color: red;
}
</style>
