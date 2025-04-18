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

    const form = ref({ name: '', level: '' })
    const editForm = ref({ name: '', level: '' })
    const editingId = ref(null)
    const languages = ref([])
    const selectedLanguage = ref('')

    const deleteTarget = ref({ id: null, name: '' })

    const rules = computed(() => ({
      name: { required },
      level: { required },
    }))
    const v$ = useVuelidate(rules, form)

    const fetchLanguages = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/languages', {
          headers: { Authorization: `Bearer ${token}` },
        })
        languages.value = Array.isArray(res.data.data) ? res.data.data : [res.data.data]
      } catch {
        toast.error('Error loading languages.')
      }
    }

    onMounted(fetchLanguages)

    const submitForm = async () => {
      const isValid = await v$.value.$validate()
      if (!isValid) {
        toast.error('Please fill all fields correctly.')
        return
      }

      try {
        const res = await axios.post('http://127.0.0.1:8000/api/languages', form.value, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.status === 201) {
          toast.success('Language added!')
          fetchLanguages()
          form.value = { name: '', level: '' }
          v$.value.$reset()
        }
      } catch {
        toast.error('Error adding language.')
      }
    }

    const editLanguage = (item) => {
      editForm.value = { name: item.name, level: item.level }
      editingId.value = item.id
      window.bootstrap.Modal.getOrCreateInstance(document.getElementById('editModal')).show()
    }

    const updateLanguage = async () => {
      if (!editingId.value) return
      try {
        const res = await axios.put(
          `http://127.0.0.1:8000/api/languages/${editingId.value}`,
          editForm.value,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        if (res.status === 200) {
          toast.success('Language updated!')
          fetchLanguages()
          window.bootstrap.Modal.getInstance(document.getElementById('editModal')).hide()
        }
      } catch {
        toast.error('Update failed.')
      }
    }

    const confirmDelete = (item) => {
      deleteTarget.value = { id: item.id, name: item.name }
      window.bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteModal')).show()
    }

    const performDelete = async () => {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/languages/${deleteTarget.value.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success('Language deleted!')
        fetchLanguages()
      } catch {
        toast.error('Delete failed.')
      } finally {
        window.bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide()
      }
    }

    const onSortEnd = async () => {
      try {
        const ordered = languages.value.map((item, index) => ({
          ...item,
          sort_order: index + 1,
        }))
        await axios.post(
          'http://127.0.0.1:8000/api/update/language/order',
          { languagess: ordered },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        toast.success('Sort order updated!')
      } catch {
        toast.error('Sort order update failed.')
      }
    }

    return {
      form,
      v$,
      submitForm,
      languages,
      editForm,
      editingId,
      editLanguage,
      updateLanguage,
      confirmDelete,
      performDelete,
      deleteTarget,
      onSortEnd,
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
            <li class="nav-item">
              <router-link to="/resume/languages" class="nav-link active font-weight-bold"
                >Language</router-link
              >
            </li>
          </ul>

          <div class="tab-content">
            <form @submit.prevent="submitForm" class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Language Name <span class="required-mask">*</span></label>
                <input v-model="form.name" type="text" class="form-control" required />
                <div v-if="v$.name.$dirty && v$.name.$error" class="text-danger">
                  Name is required.
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label">Level <span class="required-mask">*</span></label>
                <input v-model="form.level" type="text" class="form-control" required />
                <div v-if="v$.level.$dirty && v$.level.$error" class="text-danger">
                  Level is required.
                </div>
              </div>
              <div class="col-md-2">
                <button type="submit" class="btn btn-primary">Submit</button>
              </div>
            </form>

            <div class="table-responsive mt-4">
              <table class="table table-bordered table-sm">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Level</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <draggable
                  v-if="languages && languages.length > 0"
                  v-model="languages"
                  tag="tbody"
                  item-key="id"
                  @end="onSortEnd"
                >
                  <template #item="{ element }">
                    <tr>
                      <td>{{ element.name }}</td>
                      <td>{{ element.level }}</td>
                      <td>
                        <a href="#" @click.prevent="editLanguage(element)" class="text-primary"
                          ><i class="bi bi-pencil"></i> Edit</a
                        >
                        <a href="#" @click.prevent="confirmDelete(element)" class="text-danger"
                          ><i class="bi bi-trash"></i> Delete</a
                        >
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

            <!-- Edit Modal -->
            <div
              class="modal fade"
              id="editModal"
              tabindex="-1"
              aria-labelledby="editModalLabel"
              aria-hidden="true"
            >
              <div class="modal-dialog">
                <div class="modal-content">
                  <form @submit.prevent="updateLanguage">
                    <div class="modal-header">
                      <h5 class="modal-title" id="editModalLabel">Edit Language</h5>
                      <button
                        type="button"
                        class="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      />
                    </div>
                    <div class="modal-body row g-3">
                      <div class="col-md-12">
                        <label class="form-label">Language Name</label>
                        <input v-model="editForm.name" type="text" class="form-control" />
                      </div>
                      <div class="col-md-12">
                        <label class="form-label">Level</label>
                        <input v-model="editForm.level" type="text" class="form-control" />
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
