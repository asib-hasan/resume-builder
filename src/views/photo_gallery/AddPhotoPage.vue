<script>
import SideBar from '@/layout/SideBar.vue'
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { useRoute } from 'vue-router'
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
    const route = useRoute()
    const id = route.params.id
    const form = ref({
      name: '',
      status: '',
    })

    const editingIndex = ref(null)
    const editForm = ref({ name: '', status: '' })

    const folders = ref([])

    // New: deletion
    const deleteTarget = ref({ id: null, name: '' })

    const fetchFolders = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/folders', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.status === 200) {
          folders.value = Array.isArray(res.data.data) ? res.data.data : [res.data.data]
        }
      } catch {
        toast.error('Error loading folders.')
      }
    }

    onMounted(() => {
      document.getElementById('photo-gallery').classList.add('nav-active'), fetchFolders()
    })

    const rules = computed(() => ({ name: { required }, status: { required } }))
    const v$ = useVuelidate(rules, form)

    const submitForm = async () => {
      const isValid = await v$.value.$validate()
      if (!isValid) {
        return
      }

      try {
        const response = await axios.post('http://127.0.0.1:8000/api/folders', form.value, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.status === 201) {
          toast.success('Folder information added!')
          fetchFolders()
          resetForm()
        }
      } catch {
        toast.error('Failed to save folder.')
      }
    }

    const resetForm = () => {
      form.value = { name: '', status: '' }
      v$.value.$reset()
    }

    const confirmDelete = (folder) => {
      deleteTarget.value = { id: folder.id, name: folder.name }
      const modal = window.bootstrap.Modal.getOrCreateInstance(
        document.getElementById('deleteModal'),
      )
      modal.show()
    }

    const performDelete = async () => {
      if (!deleteTarget.value.id) return
      try {
        await axios.delete(`http://127.0.0.1:8000/api/folders/${deleteTarget.value.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success(`Folder information deleted!`)
        fetchFolders()
      } catch {
        toast.error('Error deleting folder.')
      } finally {
        const modal = window.bootstrap.Modal.getInstance(document.getElementById('deleteModal'))
        modal.hide()
      }
    }

    const editSkill = (folder) => {
      editForm.value = { ...folder }
      editingIndex.value = folder.id
      window.bootstrap.Modal.getOrCreateInstance(document.getElementById('editSkillModal')).show()
    }

    const updateFolder = async () => {
      if (editingIndex.value === null) return
      try {
        const response = await axios.put(
          `http://127.0.0.1:8000/api/folders/${editingIndex.value}`,
          editForm.value,
          { headers: { Authorization: `Bearer ${token}` } },
        )
        if (response.status === 200) {
          toast.success('Folder information updated!')
          fetchFolders()
          window.bootstrap.Modal.getInstance(document.getElementById('editSkillModal')).hide()
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

    const sortKey = ref('')
    const sortOrder = ref('asc')
    const sortBy = (key) => {
      if (sortKey.value === key) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortKey.value = key
        sortOrder.value = 'asc'
      }
      folders.value.sort((a, b) => {
        const valA = (a[key] || '').toString().toLowerCase()
        const valB = (b[key] || '').toString().toLowerCase()
        if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
        if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
        return 0
      })
    }

    const onSortEnd = async () => {
      try {
        const updated = folders.value.map((folder, index) => ({ ...folder, sort_order: index + 1 }))
        const res = await axios.post(
          'http://127.0.0.1:8000/api/update/folder/order',
          { folders: updated },
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
      folders,
      confirmDelete,
      performDelete,
      editSkill,
      editForm,
      updateFolder,
      sortKey,
      sortOrder,
      sortBy,
      onSortEnd,
      deleteTarget,
    }
  },
}
</script>

<template>
  <SideBar />
  <main id="main" class="main">
    <div class="pagename">
      <ol class="breadcrumb">
        <li class="breadcrumb-item active">Home</li>
        <li class="breadcrumb-item"><a href="">My Resume</a></li>
      </ol>
    </div>

    <section class="dashboard">
      <div class="row">
        <div class="col-md-12">
          <ul class="nav nav-tabs nav-tabs-bordered d-flex">
            <li class="nav-item">
              <router-link to="/photo/gallery" class="nav-link active font-weight-bold"
                >Add Folder</router-link
              >
            </li>
          </ul>

          <div class="tab-content">
            <form @submit.prevent="submitForm" class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Name <span class="required-mask">*</span></label>
                <input
                  v-model="form.name"
                  type="text"
                  class="form-select"
                  :class="{ 'is-invalid': v$.name.$dirty && v$.name.$error }"
                />
                <div v-if="v$.name.$dirty && v$.name.$error" class="error-msg">name required.</div>
              </div>

              <div class="col-md-6">
                <label class="form-label">Status<span class="required-mask">*</span></label>
                <select
                  v-model="form.status"
                  class="form-select"
                  :class="{ 'is-invalid': v$.status.$dirty && v$.status.$error }"
                >
                  <option value="">Select</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <span v-if="v$.status.$dirty && v$.status.$error" class="error-msg">
                  Status required.
                </span>
              </div>

              <div class="col-md-12">
                <button type="submit" class="btn btn-primary">Submit</button>
              </div>
            </form>

            <!-- Folders List -->
            <div class="col-md-12 mt-4">
              <table class="table table-bordered table-sm">
                <thead>
                  <tr>
                    <th @click="sortBy('name')" style="cursor: pointer">
                      Name
                      <i
                        v-if="sortKey === 'name'"
                        :class="sortOrder === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"
                      ></i>
                    </th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <draggable
                  v-if="folders && folders.length > 0"
                  v-model="folders"
                  tag="tbody"
                  item-key="id"
                  @end="onSortEnd"
                >
                  <template #item="{ element }">
                    <tr>
                      <td>{{ element.name }}</td>
                      <td>{{ element.status }}</td>
                      <td>
                        <router-link :to="`/photo/gallery/${element.id}/images`">
                          <span class="text-success"><i class="bi bi-image"></i> Add Image </span>
                        </router-link>

                        <a href="#" @click="editSkill(element)" class="text-primary">
                          <i class="bi bi-pencil"></i> Edit
                        </a>
                        <a href="#" @click="confirmDelete(element)" class="text-danger">
                          <i class="bi bi-trash"></i> Delete
                        </a>
                      </td>
                    </tr>
                  </template>
                </draggable>
                <tbody v-else>
                  <tr>
                    <td colspan="3" class="maroon">No records</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- End Folders List -->

            <!-- Edit Folder Modal -->
            <div
              class="modal fade"
              id="editSkillModal"
              tabindex="-1"
              aria-labelledby="editSkillModalLabel"
              aria-hidden="true"
            >
              <div class="modal-dialog">
                <div class="modal-content">
                  <form @submit.prevent="updateFolder">
                    <div class="modal-header">
                      <h5 class="modal-name" id="editSkillModalLabel">Edit Folder</h5>
                      <button
                        type="button"
                        class="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      />
                    </div>
                    <div class="modal-body row g-3">
                      <div class="col-md-12">
                        <label class="form-label">Folder name</label>
                        <input v-model="editForm.name" type="text" class="form-control" />
                      </div>
                      <div class="col-md-12">
                        <label class="form-label">Status</label>
                        <select v-model="editForm.status" class="form-select">
                          <option value="">Select status</option>
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
            <!-- End Edit Folder Modal -->

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
                        <p>
                          This action cannot be undone. All values associated this field will be
                          lost
                        </p>
                      </div>
                      <div class="col-md-12 text-center">
                        <button type="button" class="btn btn-danger w-100" @click="performDelete">
                          Delete Field
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
            <!-- End Delete Modal -->
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
