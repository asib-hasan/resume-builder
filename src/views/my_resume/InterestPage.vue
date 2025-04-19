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

    const form = ref({ area: '' })
    const editForm = ref({ area: '' })
    const editingId = ref(null)
    const interests = ref([])

    const deleteTarget = ref({ id: null, area: '' })

    const rules = computed(() => ({
      area: { required },
    }))
    const v$ = useVuelidate(rules, form)

    const fetchInterests = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/interests', {
          headers: { Authorization: `Bearer ${token}` },
        })
        interests.value = Array.isArray(res.data.data) ? res.data.data : [res.data.data]
      } catch {
        toast.error('Error loading interests.')
      }
    }

    onMounted(fetchInterests)

    const submitForm = async () => {
      const isValid = await v$.value.$validate()
      if (!isValid) {
        return
      }

      try {
        const res = await axios.post('http://127.0.0.1:8000/api/interests', form.value, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.status === 201) {
          toast.success('Interest added!')
          fetchInterests()
          form.value = { area: '' }
          v$.value.$reset()
        }
      } catch {
        toast.error('Error adding interest.')
      }
    }

    const editInterest = (item) => {
      editForm.value = { area: item.area }
      editingId.value = item.id
      window.bootstrap.Modal.getOrCreateInstance(document.getElementById('editModal')).show()
    }

    const updateInterest = async () => {
      if (!editingId.value) return
      try {
        const res = await axios.put(
          `http://127.0.0.1:8000/api/interests/${editingId.value}`,
          editForm.value,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        if (res.status === 200) {
          toast.success('Interest updated!')
          fetchInterests()
          window.bootstrap.Modal.getInstance(document.getElementById('editModal')).hide()
        }
      } catch {
        toast.error('Update failed.')
      }
    }

    const confirmDelete = (item) => {
      deleteTarget.value = { id: item.id, area: item.area }
      window.bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteModal')).show()
    }

    const performDelete = async () => {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/interests/${deleteTarget.value.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success('Interest deleted!')
        fetchInterests()
      } catch {
        toast.error('Delete failed.')
      } finally {
        window.bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide()
      }
    }

    const onSortEnd = async () => {
      try {
        const ordered = interests.value.map((item, index) => ({
          ...item,
          sort_order: index + 1,
        }))
        await axios.post(
          'http://127.0.0.1:8000/api/update/interest/order',
          { interests: ordered },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        toast.success('Order updated!')
      } catch {
        toast.error('Sort order update failed.')
      }
    }

    return {
      form,
      v$,
      submitForm,
      interests,
      editForm,
      editingId,
      editInterest,
      updateInterest,
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
            <li class="nav-item">
              <router-link to="/resume/interests" class="nav-link active font-weight-bold"
                >Interest</router-link
              >
            </li>
            <li class="nav-item tab-style">
              <router-link to="/resume/publications" class="nav-link font-weight-bold"
                >Publications</router-link
              >
            </li>
          </ul>

          <div class="tab-content">
            <form @submit.prevent="submitForm" class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Area <span class="required-mask">*</span></label>
                <input
                  v-model="form.area"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': v$.area.$dirty && v$.area.$error }"
                />
                <span v-if="v$.area.$dirty && v$.area.$error" class="error-msg"
                  >Area required.</span
                >
              </div>

              <div class="col-md-2">
                <label class="form-label">&nbsp;</label>
                <button type="submit" class="btn btn-primary">Submit</button>
              </div>
            </form>

            <!-- Interests List -->
            <div class="col-md-12 mt-4">
              <table class="table table-bordered table-sm">
                <thead>
                  <tr>
                    <th @click="sortBy('area')" style="cursor: pointer">
                      Area
                      <i
                        v-if="sortKey === 'area'"
                        :class="sortOrder === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"
                      ></i>
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <draggable
                  v-if="interests && interests.length > 0"
                  v-model="interests"
                  tag="tbody"
                  item-key="id"
                  @end="onSortEnd"
                >
                  <template #item="{ element }">
                    <tr>
                      <td>{{ element.area }}</td>
                      <td>
                        <a href="#" @click="editInterest(element)" class="text-primary"
                          ><i class="bi bi-pencil"></i> Edit
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
            <!-- End Interests List -->

            <!-- Edit Interests Modal -->
            <div
              class="modal fade"
              id="editModal"
              tabindex="-1"
              aria-labelledby="editModalLabel"
              aria-hidden="true"
            >
              <div class="modal-dialog">
                <div class="modal-content">
                  <form @submit.prevent="updateInterest">
                    <div class="modal-header">
                      <h5 class="modal-title" id="editModalLabel">Edit Interest</h5>
                      <button
                        type="button"
                        class="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      />
                    </div>
                    <div class="modal-body row g-3">
                      <div class="col-md-12">
                        <label class="form-label">Area</label>
                        <input v-model="editForm.area" type="text" class="form-control" />
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
            <!-- End Edit Interest Modal -->
            <div
              class="modal fade"
              id="deleteModal"
              tabindex="-1"
              aria-labelledby="confirmDeleteLabel"
              aria-hidden="true"
            >
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="deleteModal">Confirm Delete</h5>
                    <button
                      type="button"
                      class="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    ></button>
                  </div>
                  <div class="modal-body">
                    Are you sure you want to delete "<strong>{{ deleteTarget.area }}</strong
                    >"?
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                      Cancel
                    </button>
                    <button type="button" class="btn btn-danger" @click="performDelete">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <!-- End Delete Interest Modal -->
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
