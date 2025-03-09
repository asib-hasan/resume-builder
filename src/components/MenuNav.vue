<template>
  <aside id="sidebar" class="sidebar">
    <ul class="sidebar-nav" id="sidebar-nav">
      <li class="nav-heading">Club Menu</li>
      <li class="nav-item">
        <router-link class="nav-link" to="/dashboard">
          <i class="bi bi-grid"></i>
          <span>Dashboard</span>
        </router-link>
      </li>
      <li class="nav-item">
        <router-link class="nav-link" to="/profile">
          <i class="bi bi-people"></i>
          <span>My Profile</span>
        </router-link>
      </li>

      <li class="nav-heading">Common Setup</li>
      <li class="nav-item">
        <router-link class="nav-link" to="/system-info">
          <i class="bi bi-circle"></i>
          <span>System Info</span>
        </router-link>
      </li>
      <li class="nav-item">
        <router-link class="nav-link" to="/department-info">
          <i class="bi bi-circle"></i>
          <span>Department Info</span>
        </router-link>
      </li>
      <li class="nav-item">
        <router-link class="nav-link" to="/designation-info">
          <i class="bi bi-circle"></i>
          <span>Designation Info</span>
        </router-link>
      </li>
      <li class="nav-item">
        <router-link class="nav-link" to="/member-type">
          <i class="bi bi-circle"></i>
          <span>Member Type</span>
        </router-link>
      </li>

      <li class="nav-heading">Product Setup</li>
      <li class="nav-item">
        <router-link class="nav-link" to="/product-type">
          <i class="bi bi-circle"></i>
          <span>Product Type</span>
        </router-link>
      </li>
      <li class="nav-item">
        <router-link class="nav-link" to="/product-status">
          <i class="bi bi-circle"></i>
          <span>Product Status</span>
        </router-link>
      </li>
      <li class="nav-item">
        <router-link class="nav-link" to="/item-category">
          <i class="bi bi-circle"></i>
          <span>Item Category</span>
        </router-link>
      </li>
      <li class="nav-item">
        <router-link class="nav-link" to="/unit-type">
          <i class="bi bi-circle"></i>
          <span>Unit Type</span>
        </router-link>
      </li>
      <li class="nav-item">
        <router-link class="nav-link" to="/brand-info">
          <i class="bi bi-circle"></i>
          <span>Brand Info</span>
        </router-link>
      </li>

      <!-- More sections as per the original sidebar content -->
      <li class="nav-heading">Accounts Setup</li>
      <li class="nav-item">
        <router-link class="nav-link" to="/payment-type">
          <i class="bi bi-circle"></i>
          <span>Payment Type</span>
        </router-link>
      </li>
      <li class="nav-heading">Permission Setup</li>
      <li class="nav-item">
        <router-link class="nav-link" to="/set-permission">
          <i class="bi bi-circle"></i>
          <span>Set Permission</span>
        </router-link>
      </li>
      <li class="nav-item">
        <router-link class="nav-link" to="/permission-module">
          <i class="bi bi-circle"></i>
          <span>Permission Module</span>
        </router-link>
      </li>
    </ul>
  </aside>
</template>

<script>
export default {
  name: 'MenuNav',
}
</script>

<style scoped>
.sidebar-nav {
  list-style: none;
  padding: 0;
}

.nav-item {
  margin: 10px 0;
}

.nav-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #000;
}

.nav-link i {
  margin-right: 10px;
}

.nav-heading {
  font-weight: bold;
  margin-top: 20px;
  color: #888;
}
</style>
