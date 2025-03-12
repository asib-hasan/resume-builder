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
        <li class="breadcrumb-item active">Home</li>
        <li class="breadcrumb-item"><a href="">My Resume</a></li>
      </ol>
    </div>
    <section class="dashboard">
      <div class="row">
        <div class="col-md-12">
          <ul class="nav nav-tabs nav-tabs-bordered d-flex">
            <li class="nav-item">
              <a href="content.php" class="nav-link active font-weight-bold">Profile</a>
            </li>
            <li class="nav-item tab-style">
              <a href="form.php" class="nav-link font-weight-bold">Tab Two</a>
            </li>
            <li class="nav-item tab-style">
              <a href="" class="nav-link font-weight-bold">Tab Three</a>
            </li>
          </ul>
          <div class="tab-content">
            <form class="row g-3" method="" action="">
              <div class="col-md-4">
                <label class="form-label">First Name <span class="required-mask">*</span></label>
                <input type="text" class="form-control" name="first_name" value="" required />
              </div>
              <div class="col-md-4">
                <label class="form-label">Last Name <span class="required-mask">*</span></label>
                <input type="text" class="form-control" name="last_name" value="" required />
              </div>
              <div class="col-md-4">
                <label class="form-label">Gender <span class="required-mask">*</span></label>
                <select class="form-select">
                  <option>-- Select --</option>
                  <option value="1">Male</option>
                  <option value="2">Female</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label">Date of Birth<span class="required-mask">*</span></label>
                <input type="date" class="form-control" name="dob" value="" required />
              </div>
              <div class="col-md-4">
                <label class="form-label">Merital Status<span class="required-mask">*</span></label>
                <select class="form-select">
                  <option>-- Select --</option>
                  <option value="1">Single</option>
                  <option value="2">Married</option>
                  <option value="3">Divorced</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label">Profession<span class="required-mask">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  name="profession"
                  placeholder="eg. Professor"
                  required
                />
              </div>
              <div class="col-md-4">
                <label class="form-label">Address<span class="required-mask">*</span></label>
                <input type="text" class="form-control" name="address" value="" required />
              </div>
              <div class="col-md-4">
                <label class="form-label">&nbsp;</label>
                <button class="btn btn-primary">Submit</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
