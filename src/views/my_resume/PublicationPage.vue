<script>
import SideBar from '@/layout/SideBar.vue'
import useVuelidate from '@vuelidate/core'
import { required, url } from '@vuelidate/validators'
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

    const form = ref({ details: '', link: '', year: '' })
    const editForm = ref({ details: '', link: '', year: '' })
    const editingId = ref(null)
    const publications = ref([])
    const selectedDetails = ref('')

    const deleteTarget = ref({ id: null })

    const rules = computed(() => ({
      details: { required },
      link: { required, url },
      year: { required },
    }))
    const v$ = useVuelidate(rules, form)

    const fetchPublications = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/publications', {
          headers: { Authorization: `Bearer ${token}` },
        })
        publications.value = Array.isArray(res.data.data) ? res.data.data : [res.data.data]
      } catch {
        toast.error('Error loading publications.')
      }
    }

    onMounted(() => {
      document.getElementById('my-resume').classList.add('nav-active'), fetchPublications()
    })

    const submitForm = async () => {
      const isValid = await v$.value.$validate()
      if (!isValid) {
        return
      }

      try {
        const res = await axios.post('http://127.0.0.1:8000/api/publications', form.value, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.status === 201) {
          toast.success('Publication added!')
          fetchPublications()
          form.value = { details: '', link: '', year: '' }
          v$.value.$reset()
        }
      } catch {
        toast.error('Error adding publication.')
      }
    }

    const editPublication = (item) => {
      editForm.value = { details: item.details, link: item.link, year: item.year }
      editingId.value = item.id
      window.bootstrap.Modal.getOrCreateInstance(document.getElementById('editModal')).show()
    }

    const showDetails = (item) => {
      selectedDetails.value = item.details
      window.bootstrap.Modal.getOrCreateInstance(document.getElementById('viewDetailsModal')).show()
    }

    const updatePublication = async () => {
      if (!editingId.value) return
      try {
        const res = await axios.put(
          `http://127.0.0.1:8000/api/publications/${editingId.value}`,
          editForm.value,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        if (res.status === 200) {
          toast.success('Publication updated!')
          fetchPublications()
          window.bootstrap.Modal.getInstance(document.getElementById('editModal')).hide()
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

    const confirmDelete = (item) => {
      deleteTarget.value = { id: item.id }
      window.bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteModal')).show()
    }

    const performDelete = async () => {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/publications/${deleteTarget.value.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success('Publication deleted!')
        fetchPublications()
      } catch {
        toast.error('Delete failed.')
      } finally {
        window.bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide()
      }
    }

    const onSortEnd = async () => {
      try {
        const ordered = publications.value.map((item, index) => ({
          ...item,
          sort_order: index + 1,
        }))
        await axios.post(
          'http://127.0.0.1:8000/api/update/publication/order',
          { publications: ordered },
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
      publications,
      editForm,
      editingId,
      editPublication,
      updatePublication,
      confirmDelete,
      performDelete,
      deleteTarget,
      onSortEnd,
      showDetails,
      selectedDetails,
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
            <li class="nav-item">
              <router-link to="/resume/publications" class="nav-link active font-weight-bold"
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
            <li class="nav-item tab-style">
              <router-link to="/resume/awards" class="nav-link font-weight-bold"
                >Awards & Honors</router-link
              >
            </li>
          </ul>

          <div class="tab-content">
            <!-- Create Form -->
            <form @submit.prevent="submitForm" class="row g-3">
              <div class="col-md-12">
                <label class="form-label">Details <span class="required-mask">*</span></label>
                <textarea
                  v-model="form.details"
                  class="form-control"
                  :class="{ 'is-invalid': v$.details.$dirty && v$.details.$error }"
                  rows="3"
                ></textarea>
                <span v-if="v$.details.$dirty && v$.details.$error" class="error-msg">
                  Details required.
                </span>
              </div>
              <div class="col-md-6">
                <label class="form-label">Link <span class="required-mask">*</span></label>
                <input
                  v-model="form.link"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': v$.link.$dirty && v$.link.$error }"
                />
                <div v-if="v$.link.$dirty && v$.link.$error" class="error-msg">
                  Valid link required.
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label">Year <span class="required-mask">*</span></label>
                <input
                  v-model="form.year"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': v$.year.$dirty && v$.year.$error }"
                />
                <div v-if="v$.year.$dirty && v$.year.$error" class="error-msg">Year required.</div>
              </div>
              <div class="col-md-2">
                <button type="submit" class="btn btn-primary">Submit</button>
              </div>
            </form>

            <div class="table-responsive mt-4">
              <table class="table table-bordered table-sm">
                <thead>
                  <tr>
                    <th class="table-th-width-40">Details</th>
                    <th class="table-th-width-35">Link</th>
                    <th class="table-th-width-10">Year</th>
                    <th class="table-th-width-15">Actions</th>
                  </tr>
                </thead>
                <draggable
                  v-if="publications && publications.length > 0"
                  v-model="publications"
                  tag="tbody"
                  item-key="id"
                  @end="onSortEnd"
                >
                  <template #item="{ element }">
                    <tr>
                      <td>
                        <span v-if="element.details.length <= 15">
                          {{ element.details }}
                        </span>
                        <span v-else>
                          {{ element.details.slice(0, 35) }}...
                          <a href="#" @click.prevent="showDetails(element)"
                            ><span class="text-primary">View</span></a
                          >
                        </span>
                      </td>
                      <td>
                        <a :href="element.link" target="_blank"
                          >{{ element.link.slice(0, 35) }}...</a
                        >
                      </td>
                      <td>{{ element.year }}</td>
                      <td>
                        <a href="#" @click.prevent="editPublication(element)" class="text-primary">
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
                    <td colspan="4" class="maroon">No records</td>
                  </tr>
                </tbody>
              </table>

              <!-- View Full Details Modal -->
              <div
                class="modal fade"
                id="viewDetailsModal"
                tabindex="-1"
                aria-labelledby="viewDetailsModalLabel"
                aria-hidden="true"
              >
                <div class="modal-dialog modal-md">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title" id="viewDetailsModalLabel">Publication Details</h5>
                      <button
                        type="button"
                        class="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      />
                    </div>
                    <div class="modal-body">
                      {{ selectedDetails }}
                    </div>
                  </div>
                </div>
              </div>
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
                  <form @submit.prevent="updatePublication">
                    <div class="modal-header">
                      <h5 class="modal-title" id="editModalLabel">Edit Publication</h5>
                      <button
                        type="button"
                        class="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      />
                    </div>
                    <div class="modal-body row g-3">
                      <div class="col-md-12">
                        <label class="form-label">Details</label>
                        <textarea
                          v-model="editForm.details"
                          class="form-control"
                          rows="3"
                        ></textarea>
                      </div>
                      <div class="col-md-12">
                        <label class="form-label">Link</label>
                        <input v-model="editForm.link" type="url" class="form-control" />
                      </div>
                      <div class="col-md-12">
                        <label class="form-label">Year</label>
                        <input v-model="editForm.year" type="number" class="form-control" />
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
