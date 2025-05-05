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
      institute: '',
      city: '',
      degree: '',
      field_of_study: '',
      start_date: '',
      end_date: '',
      result: '',
    })

    const editingIndex = ref(null)
    const editForm = ref({
      institute: '',
      city: '',
      degree: '',
      field_of_study: '',
      start_date: '',
      end_date: '',
      result: '',
    })

    const educations = ref([])
    const sortKey = ref('')
    const sortOrder = ref('asc')
    const deleteTarget = ref({ id: null })
    const educationDetails = ref({})

    const fetchEducations = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/educations', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.status === 200) {
          educations.value = Array.isArray(res.data.data) ? res.data.data : [res.data.data]
        }
      } catch {
        toast.error('Error loading education records.')
      }
    }
    onMounted(() => {
      document.getElementById('my-resume').classList.add('nav-active'), fetchEducations()
    })

    const rules = computed(() => ({
      institute: { required },
      city: { required },
      degree: { required },
      field_of_study: { required },
      start_date: { required },
      end_date: { required },
      result: { required },
    }))
    const v$ = useVuelidate(rules, form)

    const submitForm = async () => {
      const isValid = await v$.value.$validate()
      if (!isValid) {
        toast.error('Please fill all fields.')
        return
      }

      try {
        const response = await axios.post('http://127.0.0.1:8000/api/educations', form.value, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.status === 201) {
          toast.success('Education information added!')
          fetchEducations()
          resetForm()
        }
      } catch (error) {
        console.error(error)
        toast.error('Failed to save education.')
      }
    }

    const resetForm = () => {
      form.value = {
        institute: '',
        city: '',
        degree: '',
        field_of_study: '',
        start_date: '',
        end_date: '',
        result: '',
      }
      v$.value.$reset()
    }

    const deleteEducation = async (id) => {
      if (!confirm('Are you sure?')) return
      try {
        await axios.delete(`http://127.0.0.1:8000/api/educations/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success('Education information deleted.')
        fetchEducations()
      } catch {
        toast.error('Error deleting education.')
      }
    }

    const editEducation = (education) => {
      editForm.value = { ...education }
      editingIndex.value = education.id
      window.bootstrap.Modal.getOrCreateInstance(
        document.getElementById('editEducationModal'),
      ).show()
    }

    const showDetails = (education) => {
      educationDetails.value = education
      window.bootstrap.Modal.getOrCreateInstance(document.getElementById('detailsModal')).show()
    }

    const updateEducation = async () => {
      if (editingIndex.value === null) return
      try {
        const response = await axios.put(
          `http://127.0.0.1:8000/api/educations/${editingIndex.value}`,
          editForm.value,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        if (response.status === 200) {
          toast.success('Education information updated!')
          fetchEducations()
          window.bootstrap.Modal.getInstance(document.getElementById('editEducationModal')).hide()
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
        await axios.delete(`http://127.0.0.1:8000/api/educations/${deleteTarget.value.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success('Education deleted!')
        fetchEducations()
      } catch {
        toast.error('Delete failed.')
      } finally {
        window.bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide()
      }
    }

    const sortBy = (key) => {
      if (sortKey.value === key) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortKey.value = key
        sortOrder.value = 'asc'
      }

      educations.value.sort((a, b) => {
        let valA = (a[key] || '').toString().toLowerCase()
        let valB = (b[key] || '').toString().toLowerCase()
        if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
        if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
        return 0
      })
    }

    const onSortEnd = async () => {
      try {
        const updated = educations.value.map((edu, index) => ({
          ...edu,
          sort_order: index + 1,
        }))

        const res = await axios.post(
          'http://127.0.0.1:8000/api/update/education/order',
          { educations: updated },
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
      educations,
      deleteEducation,
      editEducation,
      editForm,
      editingIndex,
      updateEducation,
      sortKey,
      sortOrder,
      sortBy,
      onSortEnd,
      performDelete,
      confirmDelete,
      showDetails,
      educationDetails,
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
            <li class="nav-item">
              <router-link to="/resume/educations" class="nav-link active font-weight-bold"
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
            <li class="nav-item tab-style">
              <router-link to="/resume/awards" class="nav-link font-weight-bold"
                >Awards & Honors</router-link
              >
            </li>
          </ul>

          <div class="tab-content">
            <form @submit.prevent="submitForm" class="row g-3">
              <div class="col-md-4">
                <label class="form-label">Institute <span class="required-mask">*</span></label>
                <input
                  v-model="form.institute"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': v$.institute.$dirty && v$.institute.$error }"
                />
                <div v-if="v$.institute.$error" class="error-msg">Institute required</div>
              </div>

              <div class="col-md-4">
                <label class="form-label">City <span class="required-mask">*</span></label>
                <input
                  v-model="form.city"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': v$.city.$dirty && v$.city.$error }"
                />
                <div v-if="v$.city.$error" class="error-msg">City required</div>
              </div>

              <div class="col-md-4">
                <label class="form-label">Degree <span class="required-mask">*</span></label>
                <input
                  v-model="form.degree"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': v$.degree.$dirty && v$.degree.$error }"
                />
                <div v-if="v$.degree.$error" class="error-msg">Degree required</div>
              </div>

              <div class="col-md-4">
                <label class="form-label">Field of Study</label>
                <input
                  v-model="form.field_of_study"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': v$.field_of_study.$dirty && v$.field_of_study.$error }"
                />
                <div v-if="v$.field_of_study.$error" class="error-msg">Field of study required</div>
              </div>

              <div class="col-md-4">
                <label class="form-label">Start Date <span class="required-mask">*</span></label>
                <input
                  v-model="form.start_date"
                  type="date"
                  class="form-control"
                  :class="{ 'is-invalid': v$.start_date.$dirty && v$.start_date.$error }"
                />
                <div v-if="v$.start_date.$error" class="error-msg">Start date required</div>
              </div>

              <div class="col-md-4">
                <label class="form-label">End Date <span class="required-mask">*</span></label>
                <input
                  v-model="form.end_date"
                  type="date"
                  class="form-control"
                  :class="{ 'is-invalid': v$.end_date.$dirty && v$.end_date.$error }"
                />
                <div v-if="v$.end_date.$error" class="error-msg">End date required</div>
              </div>

              <div class="col-md-4">
                <label class="form-label">Result <span class="required-mask">*</span></label>
                <input
                  v-model="form.result"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': v$.result.$dirty && v$.result.$error }"
                />
                <div v-if="v$.result.$error" class="error-msg">Result required</div>
              </div>

              <div class="col-md-2">
                <label class="form-label">&nbsp;</label>
                <button type="submit" class="btn btn-primary">Submit</button>
              </div>
            </form>

            <!-- Education List -->
            <div class="col-md-12 mt-4">
              <table class="table table-bordered table-sm">
                <thead>
                  <tr>
                    <th @click="sortBy('institute')" style="cursor: pointer">
                      Institute
                      <i
                        v-if="sortKey === 'institute'"
                        :class="sortOrder === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"
                      ></i>
                    </th>
                    <th>City</th>
                    <th>Degree</th>
                    <th>Field</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <draggable
                  v-if="educations && educations.length > 0"
                  v-model="educations"
                  tag="tbody"
                  item-key="id"
                  @end="onSortEnd"
                >
                  <template #item="{ element }">
                    <tr>
                      <td>{{ element.institute }}</td>
                      <td>{{ element.city }}</td>
                      <td>{{ element.degree }}</td>
                      <td>{{ element.field_of_study }}</td>
                      <td>{{ new Date(element.start_date).toLocaleDateString() }}</td>
                      <td>{{ new Date(element.end_date).toLocaleDateString() }}</td>
                      <td>
                        <a href="#" @click.prevent="showDetails(element)" class="text-info">
                          <i class="bi bi-eye"></i> Details
                        </a>
                        <a href="#" @click.prevent="editEducation(element)" class="text-primary">
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
                    <td colspan="7">Loading...</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- End Education List -->

            <!-- Edit Education Modal -->
            <div
              class="modal fade"
              id="editEducationModal"
              tabindex="-1"
              aria-labelledby="editEducationModalLabel"
              aria-hidden="true"
            >
              <div class="modal-dialog modal-lg">
                <div class="modal-content">
                  <form @submit.prevent="updateEducation">
                    <div class="modal-header">
                      <h5 class="modal-title" id="editEducationModalLabel">Edit Education</h5>
                      <button
                        type="button"
                        class="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      />
                    </div>
                    <div class="modal-body row g-3">
                      <div class="col-md-4">
                        <label class="form-label"
                          >Institute <span class="required-mask">*</span></label
                        >
                        <input v-model="editForm.institute" type="text" class="form-control" />
                      </div>
                      <div class="col-md-4">
                        <label class="form-label">City <span class="required-mask">*</span></label>
                        <input v-model="editForm.city" type="text" class="form-control" />
                      </div>
                      <div class="col-md-4">
                        <label class="form-label"
                          >Degree <span class="required-mask">*</span></label
                        >
                        <input v-model="editForm.degree" type="text" class="form-control" />
                      </div>
                      <div class="col-md-4">
                        <label class="form-label"
                          >Field of Study <span class="required-mask">*</span></label
                        >
                        <input v-model="editForm.field_of_study" type="text" class="form-control" />
                      </div>
                      <div class="col-md-4">
                        <label class="form-label"
                          >Start Date <span class="required-mask">*</span></label
                        >
                        <input v-model="editForm.start_date" type="date" class="form-control" />
                      </div>
                      <div class="col-md-4">
                        <label class="form-label"
                          >End Date <span class="required-mask">*</span></label
                        >
                        <input v-model="editForm.end_date" type="date" class="form-control" />
                      </div>
                      <div class="col-md-4">
                        <label class="form-label"
                          >Result <span class="required-mask">*</span></label
                        >
                        <input v-model="editForm.result" type="text" class="form-control" />
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
            <!-- End Edit Education Modal -->

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

            <div class="modal fade" id="detailsModal" tabindex="-1" aria-hidden="true">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Education Details</h5>
                    <button
                      type="button"
                      class="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    ></button>
                  </div>
                  <div class="modal-body">
                    <table class="table table-sm table-bordered">
                      <tbody>
                        <tr>
                          <th>Institute</th>
                          <td>{{ educationDetails.institute }}</td>
                        </tr>
                        <tr>
                          <th>City</th>
                          <td>{{ educationDetails.city }}</td>
                        </tr>
                        <tr>
                          <th>Degree</th>
                          <td>{{ educationDetails.degree }}</td>
                        </tr>
                        <tr>
                          <th>Field of Study</th>
                          <td>{{ educationDetails.field_of_study }}</td>
                        </tr>
                        <tr>
                          <th>Start Date</th>
                          <td>{{ new Date(educationDetails.start_date).toLocaleDateString() }}</td>
                        </tr>
                        <tr>
                          <th>End Date</th>
                          <td>{{ new Date(educationDetails.end_date).toLocaleDateString() }}</td>
                        </tr>
                        <tr>
                          <th>Result</th>
                          <td>{{ educationDetails.result }}</td>
                        </tr>
                      </tbody>
                    </table>
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
