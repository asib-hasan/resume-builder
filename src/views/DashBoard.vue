<script>
import SideBar from '@/layout/SideBar.vue'
import { ref, onMounted } from 'vue'

export default {
  components: { SideBar },
  setup() {
    const jobs = ref([])
    const loading = ref(true)

    onMounted(() => {
      const dashboardItem = document.getElementById('dashboard')
      if (dashboardItem) dashboardItem.classList.add('nav-active')

      fetch('https://remoteok.com/api')
        .then((res) => res.json())
        .then((data) => {
          jobs.value = Array.isArray(data) ? data.slice(1, 6) : []
          loading.value = false
        })
        .catch((err) => {
          console.error('Error fetching jobs:', err)
          loading.value = false
        })
    })

    return {
      jobs,
      loading,
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
        <li class="breadcrumb-item"><a href="#">Dashboard</a></li>
      </ol>
    </div>

    <section class="dashboard">
      <div class="row">
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Resume Completion</h5>
              <p class="card-text">You are almost there</p>
              <div class="progress mb-2">
                <div
                  class="progress-bar"
                  role="progressbar"
                  style="width: 50%"
                  aria-valuenow="50"
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  50%
                </div>
              </div>
              <a href="#" class="small text-primary float-end">
                Complete Profile <i class="bi bi-arrow-right ms-1"></i>
              </a>
            </div>
          </div>
        </div>

        <div class="col-md-8">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Latest Job Posts</h5>
              <ul class="list-group list-group-flush">
                <li v-if="loading" class="list-group-item">Loading jobs...</li>
                <li v-for="job in jobs" :key="job.id" class="list-group-item">
                  <strong>{{ job.position || job.title }}</strong
                  ><br />
                  <small class="text-muted"
                    >{{ job.company }} · {{ job.location || 'Remote' }}</small
                  ><br />
                  <a :href="job.url" target="_blank" class="small text-primary">
                    View Details &rarr;
                  </a>
                </li>
                <li v-if="!loading && jobs.length === 0" class="list-group-item text-muted">
                  No job posts available.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
