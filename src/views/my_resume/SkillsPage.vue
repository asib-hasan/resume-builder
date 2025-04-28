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
      level: '',
    })

    const editingIndex = ref(null)
    const editForm = ref({ title: '', level: '' })

    const skills = ref([])

    // New: deletion
    const deleteTarget = ref({ id: null, title: '' })

    const fetchSkills = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/skills', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.status === 200) {
          skills.value = Array.isArray(res.data.data) ? res.data.data : [res.data.data]
        }
      } catch {
        toast.error('Error loading skills.')
      }
    }

    onMounted(() => {
      document.getElementById('my-resume').classList.add('nav-active'), fetchSkills()
    })

    const rules = computed(() => ({ title: { required }, level: { required } }))
    const v$ = useVuelidate(rules, form)

    const submitForm = async () => {
      const isValid = await v$.value.$validate()
      if (!isValid) {
        return
      }

      try {
        const response = await axios.post('http://127.0.0.1:8000/api/skills', form.value, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.status === 201) {
          toast.success('Skill saved!')
          fetchSkills()
          resetForm()
        }
      } catch {
        toast.error('Failed to save skill.')
      }
    }

    const resetForm = () => {
      form.value = { title: '', level: '' }
      v$.value.$reset()
    }

    const confirmDelete = (skill) => {
      deleteTarget.value = { id: skill.id, title: skill.title }
      const modal = window.bootstrap.Modal.getOrCreateInstance(
        document.getElementById('confirmDeleteModal'),
      )
      modal.show()
    }

    const performDelete = async () => {
      if (!deleteTarget.value.id) return
      try {
        await axios.delete(`http://127.0.0.1:8000/api/skills/${deleteTarget.value.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success(`Deleted: ${deleteTarget.value.title}`)
        fetchSkills()
      } catch {
        toast.error('Error deleting skill.')
      } finally {
        const modal = window.bootstrap.Modal.getInstance(
          document.getElementById('confirmDeleteModal'),
        )
        modal.hide()
      }
    }

    const editSkill = (skill) => {
      editForm.value = { ...skill }
      editingIndex.value = skill.id
      window.bootstrap.Modal.getOrCreateInstance(document.getElementById('editSkillModal')).show()
    }

    const updateSkill = async () => {
      if (editingIndex.value === null) return
      try {
        const response = await axios.put(
          `http://127.0.0.1:8000/api/skills/${editingIndex.value}`,
          editForm.value,
          { headers: { Authorization: `Bearer ${token}` } },
        )
        if (response.status === 200) {
          toast.success('Skill updated!')
          fetchSkills()
          window.bootstrap.Modal.getInstance(document.getElementById('editSkillModal')).hide()
        }
      } catch {
        toast.error('Error updating skill.')
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
      skills.value.sort((a, b) => {
        const valA = (a[key] || '').toString().toLowerCase()
        const valB = (b[key] || '').toString().toLowerCase()
        if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
        if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
        return 0
      })
    }

    const onSortEnd = async () => {
      try {
        const updated = skills.value.map((skill, index) => ({ ...skill, sort_order: index + 1 }))
        const res = await axios.post(
          'http://127.0.0.1:8000/api/update/skill/order',
          { skills: updated },
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
      skills,
      confirmDelete,
      performDelete,
      editSkill,
      editForm,
      updateSkill,
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
            <li class="nav-item">
              <router-link to="/resume/skills" class="nav-link active font-weight-bold"
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
              <div class="col-md-6">
                <label class="form-label">Title <span class="required-mask">*</span></label>
                <input
                  v-model="form.title"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': v$.title.$dirty && v$.title.$error }"
                />
                <div v-if="v$.title.$dirty && v$.title.$error" class="error-msg">
                  Title required.
                </div>
              </div>

              <div class="col-md-6">
                <label class="form-label"
                  >Level (Out of 10)<span class="required-mask">*</span></label
                >
                <input
                  v-model="form.level"
                  type="number"
                  max="10"
                  min="1"
                  class="form-control"
                  :class="{ 'is-invalid': v$.level.$dirty && v$.level.$error }"
                />
                <span v-if="v$.level.$dirty && v$.level.$error" class="error-msg">
                  Level required.
                </span>
              </div>

              <div class="col-md-12">
                <button type="submit" class="btn btn-primary">Submit</button>
              </div>
            </form>

            <!-- Skills List -->
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
                    <th>Level</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <draggable
                  v-if="skills && skills.length > 0"
                  v-model="skills"
                  tag="tbody"
                  item-key="id"
                  @end="onSortEnd"
                >
                  <template #item="{ element }">
                    <tr>
                      <td>{{ element.title }}</td>
                      <td>{{ element.level }}</td>
                      <td>
                        <a href="#" @click="editSkill(element)" class="text-primary"
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
            <!-- End Skills List -->

            <!-- Edit Skill Modal -->
            <div
              class="modal fade"
              id="editSkillModal"
              tabindex="-1"
              aria-labelledby="editSkillModalLabel"
              aria-hidden="true"
            >
              <div class="modal-dialog">
                <div class="modal-content">
                  <form @submit.prevent="updateSkill">
                    <div class="modal-header">
                      <h5 class="modal-title" id="editSkillModalLabel">Edit Skill</h5>
                      <button
                        type="button"
                        class="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      />
                    </div>
                    <div class="modal-body row g-3">
                      <div class="col-md-12">
                        <label class="form-label">Skill Title</label>
                        <input v-model="editForm.title" type="text" class="form-control" />
                      </div>
                      <div class="col-md-12">
                        <label class="form-label">Skill Level</label>
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
            <!-- End Edit Skill Modal -->
            <div
              class="modal fade"
              id="confirmDeleteModal"
              tabindex="-1"
              aria-labelledby="confirmDeleteLabel"
              aria-hidden="true"
            >
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="confirmDeleteLabel">Confirm Delete</h5>
                    <button
                      type="button"
                      class="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    ></button>
                  </div>
                  <div class="modal-body">
                    Are you sure you want to delete "<strong>{{ deleteTarget.title }}</strong
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
            <!-- End Delete Skill Modal -->
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
