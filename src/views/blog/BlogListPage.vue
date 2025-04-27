<script setup>
import SideBar from '@/layout/SideBar.vue'
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toast-notification'

const blogs = ref([])
const selectID = ref(null)
const toast = useToast()
const token = localStorage.getItem('token')

// Fetch blogs from API
const fetchData = async () => {
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/blogs', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    blogs.value = res.data.data
  } catch (error) {
    console.error(error)
    toast.error('Failed to load blogs.')
  }
}

// Open delete modal
const confirmDelete = (id) => {
  selectID.value = id
  window.bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteModal')).show()
}

// Perform delete
const performDelete = async () => {
  try {
    await axios.delete(`http://127.0.0.1:8000/api/blogs/${selectID.value}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    toast.success('Blog deleted successfully!')
    fetchData()
    window.bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteModal')).hide()
  } catch (error) {
    console.error(error)
    toast.error('Failed to delete blog.')
  }
}

const toggleStatus = async (id, status) => {
  try {
    await axios.put(
      `http://127.0.0.1:8000/api/blogs/update/status/${id}`,
      {
        status: status,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    toast.success('Blog status updated successfully!')
    fetchData()
  } catch (error) {
    console.error(error)
    toast.error('Failed to update blog status.')
  }
}

onMounted(() => {
  fetchData()
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
              <router-link to="/blog/add" class="nav-link font-weight-bold"
                >Create Blog</router-link
              >
            </li>
            <li class="nav-item">
              <a href="#" class="nav-link active font-weight-bold">List</a>
            </li>
          </ul>

          <div class="tab-content">
            <div class="table-responsive">
              <table class="table table-bordered table-hover table-sm">
                <thead>
                  <tr>
                    <th class="table-th-width-30">Title</th>
                    <th class="table-th-width-20">Category</th>
                    <th class="table-th-width-10">Date</th>
                    <th class="table-th-width-15">Status</th>
                    <th class="table-th-width-15">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="val in blogs" :key="val.id">
                    <td :title="val.title">
                      {{ val.title.length > 40 ? val.title.slice(0, 40) + '...' : val.title }}
                    </td>

                    <td>{{ val.category }}</td>
                    <td>{{ new Date(val.date).toLocaleDateString() }}</td>

                    <td>
                      <div class="form-check form-switch">
                        <input
                          v-if="val.status === 'active'"
                          class="form-check-input"
                          type="checkbox"
                          :id="`switch-${val.id}`"
                          checked
                          @change="toggleStatus(val.id, 'inactive')"
                        />
                        <input
                          v-else
                          class="form-check-input"
                          type="checkbox"
                          :id="`switch-${val.id}`"
                          @change="toggleStatus(val.id, 'active')"
                        />
                        <label class="form-check-label" :for="`switch-${val.id}`">
                          {{ val.status === 'active' ? 'Active' : 'Inactive' }}
                        </label>
                      </div>
                    </td>

                    <td>
                      <router-link :to="`/blog/edit/${val.id}`">
                        <span class="text-primary"><i class="bi bi-pencil"></i> Edit</span>
                      </router-link>

                      <a href="#" @click.prevent="confirmDelete(val.id)" class="text-danger">
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
