<script>
import SideBar from '@/layout/SideBar.vue'
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import draggable from 'vuedraggable'
import { useToast } from 'vue-toast-notification'
import { baseImageURL } from '@/config'
export default {
  components: {
    SideBar,
    draggable,
  },
  setup() {
    const token = localStorage.getItem('token')
    const toast = useToast()

    const form = ref({ title: '', image: null })
    const editForm = ref({ title: '', image: null })
    const editingId = ref(null)
    const certifications = ref([])

    const deleteTarget = ref({ id: null, title: '' })

    const rules = computed(() => ({
      title: { required },
      image: { required },
    }))
    const v$ = useVuelidate(rules, form)

    const fetchCertifications = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/certifications', {
          headers: { Authorization: `Bearer ${token}` },
        })
        certifications.value = Array.isArray(res.data.data) ? res.data.data : [res.data.data]
      } catch {
        toast.error('Error loading certifications.')
      }
    }

    const selectedImage = ref('')

    function viewCertificate(element) {
      selectedImage.value = `${baseImageURL}/${element.image}`
      console.log(selectedImage.value)

      window.bootstrap.Modal.getOrCreateInstance(
        document.getElementById('viewCertificateModal'),
      ).show()
    }

    onMounted(() => {
      document.getElementById('my-resume').classList.add('nav-active'), fetchCertifications()
    })

    const handleFileChange = (event) => {
      form.value.image = event.target.files[0]
      v$.value.image.$touch()
    }

    const handleEditFileChange = (event) => {
      editForm.value.image = event.target.files[0]
    }

    const submitForm = async () => {
      const isValid = await v$.value.$validate()
      if (!isValid) return

      const payload = new FormData()
      payload.append('title', form.value.title)
      if (form.value.image) payload.append('image', form.value.image)

      try {
        const res = await axios.post('http://127.0.0.1:8000/api/certifications', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        })
        if (res.status === 201) {
          toast.success('Certification added!')
          fetchCertifications()
          form.value = { title: '', image: null }
          v$.value.$reset()
        }
      } catch {
        toast.error('Error adding certification.')
      }
    }

    const editCertification = (item) => {
      editForm.value = { title: item.title, image: item.image }
      editingId.value = item.id
      window.bootstrap.Modal.getOrCreateInstance(document.getElementById('editModal')).show()
    }

    const updateCertification = async () => {
      if (!editingId.value) return

      const payload = new FormData()
      payload.append('title', editForm.value.title)
      if (editForm.value.image) payload.append('image', editForm.value.image)
      payload.append('_method', 'PUT')

      try {
        const res = await axios.post(
          `http://127.0.0.1:8000/api/certifications/${editingId.value}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          },
        )
        if (res.status === 200) {
          toast.success('Certification updated!')
          fetchCertifications()
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
      deleteTarget.value = { id: item.id, title: item.title }
      window.bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteModal')).show()
    }

    const performDelete = async () => {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/certifications/${deleteTarget.value.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success('Certification deleted!')
        fetchCertifications()
      } catch {
        toast.error('Delete failed.')
      } finally {
        window.bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide()
      }
    }

    const onSortEnd = async () => {
      try {
        const ordered = certifications.value.map((item, index) => ({
          ...item,
          sort_order: index + 1,
        }))
        await axios.post(
          'http://127.0.0.1:8000/api/update/certification/order',
          { certifications: ordered },
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
      certifications,
      editForm,
      editingId,
      editCertification,
      updateCertification,
      confirmDelete,
      performDelete,
      deleteTarget,
      onSortEnd,
      handleFileChange,
      handleEditFileChange,
      baseImageURL,
      viewCertificate,
      selectedImage,
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
            <li class="nav-item">
              <router-link to="/resume/certifications" class="nav-link active font-weight-bold"
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
              <div class="col-md-6">
                <label class="form-label"
                  >Certification Title <span class="required-mask">*</span></label
                >
                <input
                  v-model="form.title"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': v$.title.$dirty && v$.title.$error }"
                />
                <span v-if="v$.title.$dirty && v$.title.$error" class="error-msg">
                  Title required.
                </span>
              </div>
              <div class="col-md-6">
                <label class="form-label">
                  Upload Certificate <span class="required-mask">*</span>
                </label>
                <input
                  type="file"
                  class="form-control"
                  @change="handleFileChange"
                  :class="{ 'is-invalid': v$.image.$dirty && v$.image.$error }"
                />
                <span v-if="v$.image.$dirty && v$.image.$error" class="error-msg">
                  Certificate image required.
                </span>
              </div>
              <div class="col-md-2">
                <button type="submit" class="btn btn-primary">Submit</button>
              </div>
            </form>

            <div class="table-responsive mt-4">
              <table class="table table-bordered table-sm">
                <thead>
                  <tr>
                    <th class="table-th-width-70">Title</th>
                    <th class="table-th-width-30">Actions</th>
                  </tr>
                </thead>
                <draggable
                  v-if="certifications && certifications.length > 0"
                  v-model="certifications"
                  tag="tbody"
                  item-key="id"
                  @end="onSortEnd"
                >
                  <template #item="{ element }">
                    <tr>
                      <td>{{ element.title }}</td>
                      <td>
                        <a
                          href="#"
                          @click.prevent="viewCertificate(element)"
                          class="text-secondary"
                        >
                          <i class="bi bi-eye"></i> Preview
                        </a>
                        <a
                          href="#"
                          @click.prevent="editCertification(element)"
                          class="text-primary"
                        >
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
                    <td colspan="3" class="maroon">No records</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Bootstrap Modal -->
            <div
              class="modal fade"
              id="viewCertificateModal"
              tabindex="-1"
              aria-labelledby="viewCertificateModalLabel"
              aria-hidden="true"
            >
              <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="viewCertificateModalLabel">Certificate Preview</h5>
                    <button
                      type="button"
                      class="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    ></button>
                  </div>
                  <div class="modal-body text-center">
                    <img
                      :src="selectedImage"
                      alt="Full Certificate"
                      class="img-fluid"
                      v-if="selectedImage"
                    />
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
                  <form @submit.prevent="updateCertification">
                    <div class="modal-header">
                      <h5 class="modal-title" id="editModalLabel">Edit Certification</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" />
                    </div>
                    <div class="modal-body row g-3">
                      <div class="col-md-12">
                        <label class="form-label">Title <span class="required-mask">*</span></label>
                        <input v-model="editForm.title" type="text" class="form-control" />
                      </div>
                      <div class="col-md-12">
                        <label class="form-label"
                          >Replace Image <span class="required-mask">*</span></label
                        >
                        <input type="file" class="form-control" @change="handleEditFileChange" />
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
