<script>
import SideBar from '@/layout/SideBar.vue'
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import draggable from 'vuedraggable'
import { useToast } from 'vue-toast-notification'

export default {
  components: {
    SideBar,
    draggable,
  },
  setup() {
    const token = localStorage.getItem('token')
    const toast = useToast()

    const form = ref({
      title: '',
      status: '',
    })

    const editingIndex = ref(null)
    const editForm = ref({
      title: '',
      status: '',
    })

    const awards = ref([])
    const sortKey = ref('')
    const sortOrder = ref('asc')
    const deleteTarget = ref({ id: null, title: '', status: '' })

    const fetchAwards = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/awards', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.status === 200) {
          awards.value = Array.isArray(res.data.data) ? res.data.data : [res.data.data]
        }
      } catch {
        toast.error('Error loading awards.')
      }
    }

    onMounted(() => {
      document.getElementById('my-resume').classList.add('nav-active'), fetchAwards()
    })

    const rules = computed(() => ({
      title: { required },
      status: { required },
    }))
    const v$ = useVuelidate(rules, form)

    const submitForm = async () => {
      const isValid = await v$.value.$validate()
      if (!isValid) {
        return
      }

      try {
        const response = await axios.post('http://127.0.0.1:8000/api/awards', form.value, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.status === 201) {
          toast.success('Award saved!')
          fetchAwards()
          resetForm()
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

    const resetForm = () => {
      form.value = {
        title: '',
        status: '',
      }
      v$.value.$reset()
    }

    const confirmDelete = (item) => {
      deleteTarget.value = { id: item.id, title: item.title }
      window.bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteModal')).show()
    }

    const performDelete = async () => {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/awards/${deleteTarget.value.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success('Certification deleted!')
        fetchAwards()
      } catch {
        toast.error('Delete failed.')
      } finally {
        window.bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide()
      }
    }

    const editAward = (award) => {
      editForm.value = { ...award }
      editingIndex.value = award.id
      window.bootstrap.Modal.getOrCreateInstance(document.getElementById('editAwardModal')).show()
    }

    const updateAward = async () => {
      if (editingIndex.value === null) return
      try {
        const response = await axios.put(
          `http://127.0.0.1:8000/api/awards/${editingIndex.value}`,
          editForm.value,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        if (response.status === 200) {
          toast.success('Award updated!')
          fetchAwards()
          window.bootstrap.Modal.getInstance(document.getElementById('editAwardModal')).hide()
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

    const sortBy = (key) => {
      if (sortKey.value === key) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortKey.value = key
        sortOrder.value = 'asc'
      }

      awards.value.sort((a, b) => {
        let valA = (a[key] || '').toString().toLowerCase()
        let valB = (b[key] || '').toString().toLowerCase()
        if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
        if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
        return 0
      })
    }

    const onSortEnd = async () => {
      try {
        const updated = awards.value.map((award, index) => ({
          ...award,
          sort_order: index + 1,
        }))

        const res = await axios.post(
          'http://127.0.0.1:8000/api/update/award/order',
          { awards: updated },
          { headers: { Authorization: `Bearer ${token}` } },
        )

        if (res.status === 200) toast.success('Sort order updated!')
      } catch {
        toast.error('Sort update failed.')
      }
    }

    return {
      form,
      v$,
      submitForm,
      awards,
      editAward,
      editForm,
      editingIndex,
      updateAward,
      sortKey,
      sortOrder,
      sortBy,
      onSortEnd,
      confirmDelete,
      performDelete,
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
            <li class="nav-item">
              <router-link to="/resume/awards" class="nav-link active font-weight-bold"
                >Awards & Honors</router-link
              >
            </li>
          </ul>

          <div class="tab-content">
            <form @submit.prevent="submitForm" class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Title <span class="required-mask">*</span></label>
                <input
                  v-model="form.title"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': v$.title.$dirty && v$.title.$error }"
                />
                <span v-if="v$.title.$dirty && v$.title.$error" class="error-msg">
                  Title required
                </span>
              </div>

              <div class="col-md-4">
                <label class="form-label">Status <span class="required-mask">*</span></label>
                <select
                  v-model="form.status"
                  class="form-control"
                  :class="{ 'is-invalid': v$.status.$dirty && v$.status.$error }"
                >
                  <option value="">Select</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <span v-if="v$.status.$dirty && v$.status.$error" class="error-msg">
                  Status required
                </span>
              </div>

              <div class="col-md-2">
                <label class="form-label">&nbsp;</label>
                <button type="submit" class="btn btn-primary">Submit</button>
              </div>
            </form>

            <div class="col-md-12 mt-4">
              <table class="table table-bordered table-sm">
                <thead>
                  <tr>
                    <th @click="sortBy('title')" style="cursor: pointer">
                      Title
                      <i
                        v-if="sortKey === 'title'"
                        :class="sortOrder === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"
                      ></i>
                    </th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <draggable
                  v-if="awards && awards.length > 0"
                  v-model="awards"
                  tag="tbody"
                  item-key="id"
                  @end="onSortEnd"
                >
                  <template #item="{ element }">
                    <tr>
                      <td>{{ element.title }}</td>
                      <td>
                        <span v-if="element.status === 'active'" class="badge bg-success">
                          Active
                        </span>
                        <span v-else class="badge bg-warning text-dark"> Inactive </span>
                      </td>

                      <td>
                        <a href="#" @click.prevent="editAward(element)" class="text-primary">
                          <i class="bi bi-pencil"></i> Edit
                        </a>
                        <a href="#" @click.prevent="confirmDelete(element)" class="text-danger">
                          <i class="bi bi-trash"></i> Delete
                        </a>
                      </td>
                    </tr>
                  </template>
                </draggable>
                <tbody v-else>
                  <tr>
                    <td colspan="3">Loading...</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Edit Award Modal -->
            <div
              class="modal fade"
              id="editAwardModal"
              tabindex="-1"
              aria-labelledby="editAwardModalLabel"
              aria-hidden="true"
            >
              <div class="modal-dialog">
                <div class="modal-content">
                  <form @submit.prevent="updateAward">
                    <div class="modal-header">
                      <h5 class="modal-title" id="editAwardModalLabel">Edit Award</h5>
                      <button
                        type="button"
                        class="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      />
                    </div>
                    <div class="modal-body row g-3">
                      <div class="col-md-6">
                        <label class="form-label">Title</label>
                        <input v-model="editForm.title" type="text" class="form-control" />
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Status</label>
                        <select v-model="editForm.status" class="form-control">
                          <option value="">Select Status</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        Cancel
                      </button>
                      <button type="submit" class="btn btn-primary">Update</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <!-- End Edit Award Modal -->

            <!-- Delete Modal -->
            <div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true">
              <div class="modal-dialog" style="max-width: 400px">
                <div class="modal-content">
                  <div class="modal-body">
                    <div class="row mt-3 text-center">
                      <div class="col-md-12 circle">
                        <i
                          class="bi bi-exclamation-triangle-fill text-danger"
                          style="background-color: #facdcd; padding: 4px; border-radius: 50%"
                        ></i>
                      </div>
                      <div class="col-md-12 mt-3">
                        <h5 class="font-weight-bold">Are you sure?</h5>
                        <p class="text-muted">
                          This action cannot be undone. All values associated with this field will
                          be lost.
                        </p>
                      </div>
                      <div class="col-md-12">
                        <button type="button" class="btn btn-danger w-100" @click="performDelete">
                          Delete Field
                        </button>
                        <button
                          type="button"
                          class="btn btn-secondary w-100 mt-2"
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
            <!-- End Delete Modal -->
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
