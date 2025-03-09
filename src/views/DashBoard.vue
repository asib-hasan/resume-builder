<script>
import SideBar from '@/layout/SideBar.vue'

export default {
  components: { SideBar },
}
</script>

<template>
  <SideBar />
  <main id="main" class="main">
    <div class="pagetitle">
      <ol class="breadcrumb">
        <li class="breadcrumb-item active">Common Setup</li>
        <li class="breadcrumb-item"><a href="">Form</a></li>
      </ol>
    </div>
    <section class="dashboard">
      <div class="row">
        <div class="col-md-12">
          <ul class="nav nav-tabs nav-tabs-bordered d-flex">
            <li class="nav-item tab-style">
              <a href="content.php" class="nav-link font-weight-bold">Tab One</a>
            </li>
            <li class="nav-item">
              <a href="form.php" class="nav-link active font-weight-bold">Tab Two</a>
            </li>
            <li class="nav-item tab-style">
              <a href="" class="nav-link font-weight-bold">Tab Three</a>
            </li>
          </ul>
          <div class="tab-content">
            <form class="row g-3" method="" action="">
              <div class="col-md-3">
                <label class="form-label">Text Input <span class="required-mask">*</span></label>
                <input type="text" class="form-control" name="text_input" value="" required />
              </div>
              <div class="col-md-3">
                <label class="form-label">Number Input <span class="required-mask">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  name="number_input"
                  value=""
                  oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
                  required
                />
              </div>
              <div class="col-md-3">
                <label class="form-label">Select Box <span class="required-mask">*</span></label>
                <select class="form-select">
                  <option>-- Select --</option>
                  <option value="1">Option One</option>
                  <option value="2">Option Two</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">&nbsp;</label>
                <button class="btn btn-primary">Submit</button>
              </div>
            </form>

            <div class="card mt-5">
              <div class="card-header">
                Form
                <a href="" class="card-header-action-btn"
                  ><i class="bi bi-plus-circle-fill"></i> Add New</a
                >
              </div>
              <div class="card-body">
                <form class="row g-3 mt-1" method="" action="">
                  <div class="col-md-3">
                    <label class="form-label"
                      >Text Input <span class="required-mask">*</span></label
                    >
                    <input type="text" class="form-control" name="text_input" value="" required />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label"
                      >Number Input <span class="required-mask">*</span></label
                    >
                    <input
                      type="text"
                      class="form-control"
                      name="number_input"
                      value=""
                      oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
                      required
                    />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label"
                      >Select Box <span class="required-mask">*</span></label
                    >
                    <select class="form-select">
                      <option>-- Select --</option>
                      <option value="1">Option One</option>
                      <option value="2">Option Two</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">&nbsp;</label>
                    <button class="btn btn-primary">Submit</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
