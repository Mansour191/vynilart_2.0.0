<template>
  <div class="users-manager">
    <!-- Header Section -->
    <div class="users-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">إدارة المستخدمين</h1>
          <p class="page-subtitle">إدارة حسابات المستخدمين والصلاحيات</p>
        </div>
        <div class="header-right">
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="showAddUserDialog = true"
            class="add-user-btn"
          >
            إضافة مستخدم
          </v-btn>
          <v-btn
            color="secondary"
            prepend-icon="mdi-sync"
            @click="syncUsers"
            :loading="syncing"
            class="sync-btn"
          >
            مزامنة
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="users-content">
      <!-- Statistics Cards -->
      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-card" v-for="stat in userStats" :key="stat.label">
            <div class="stat-icon" :style="{ background: stat.color + '20' }">
              <i :class="stat.icon" :style="{ color: stat.color }"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
              <div class="stat-trend" :class="{ up: stat.trend > 0, down: stat.trend < 0 }">
                <i :class="stat.trend > 0 ? 'fa-solid fa-arrow-up' : 'fa-solid fa-arrow-down'"></i>
                {{ Math.abs(stat.trend) }}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="filters-section">
        <div class="search-wrapper">
          <v-text-field
            v-model="searchQuery"
            label="بحث عن مستخدم..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            class="search-field"
          ></v-text-field>
        </div>
        <div class="filter-chips">
          <v-chip-group v-model="selectedFilters" multiple>
            <v-chip
              v-for="filter in availableFilters"
              :key="filter.value"
              :value="filter.value"
              :prepend-icon="filter.icon"
              variant="outlined"
              size="small"
            >
              {{ filter.label }}
            </v-chip>
          </v-chip-group>
        </div>
      </div>

      <!-- Users Table -->
      <div class="users-table-section">
        <v-data-table
          :headers="tableHeaders"
          :items="filteredUsers"
          :loading="loading"
          :search="searchQuery"
          class="users-table"
          :items-per-page="[10, 25, 50, 100]"
          :sort-by="[{ key: 'created_at', order: 'desc' }]"
        >
          <template v-slot:item.avatar="{ item }">
            <v-avatar size="40" class="user-avatar">
              <img :src="item.avatar || '/default-avatar.png'" :alt="item.name" />
            </v-avatar>
          </template>

          <template v-slot:item.name="{ item }">
            <div class="user-info">
              <div class="user-name">{{ item.name }}</div>
              <div class="user-email">{{ item.email }}</div>
            </div>
          </template>

          <template v-slot:item.role="{ item }">
            <v-chip
              :color="getRoleColor(item.role)"
              size="small"
              variant="flat"
            >
              {{ getRoleLabel(item.role) }}
            </v-chip>
          </template>

          <template v-slot:item.status="{ item }">
            <v-chip
              :color="item.active ? 'success' : 'error'"
              size="small"
              variant="flat"
            >
              {{ item.active ? 'نشط' : 'غير نشط' }}
            </v-chip>
          </template>

          <template v-slot:item.last_login="{ item }">
            <div class="last-login">
              <div v-if="item.last_login">
                {{ formatDate(item.last_login) }}
              </div>
              <div v-else class="no-login">
                لم يسجل دخوله
              </div>
            </div>
          </template>

          <template v-slot:item.actions="{ item }">
            <div class="action-buttons">
              <v-btn
                icon="mdi-eye"
                size="small"
                variant="text"
                @click="viewUser(item)"
                class="action-btn"
              ></v-btn>
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                @click="editUser(item)"
                class="action-btn"
              ></v-btn>
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                @click="deleteUser(item)"
                class="action-btn"
              ></v-btn>
            </div>
          </template>
        </v-data-table>
      </div>
    </div>

    <!-- Add/Edit User Dialog -->
    <v-dialog v-model="showAddUserDialog" max-width="600">
      <v-card>
        <v-card-title class="dialog-title">
          {{ editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="userForm" v-model="userFormValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="userForm.name"
                  label="الاسم الكامل"
                  :rules="[v => !!v || 'الاسم مطلوب']"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="userForm.email"
                  label="البريد الإلكتروني"
                  :rules="[v => !!v || 'البريد الإلكتروني مطلوب', v => /.+@.+\..+/.test(v) || 'البريد الإلكتروني غير صالح']"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="userForm.phone"
                  label="رقم الهاتف"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="userForm.role"
                  label="الدور"
                  :items="roleOptions"
                  item-title="label"
                  item-value="value"
                  :rules="[v => !!v || 'الدور مطلوب']"
                  variant="outlined"
                  density="compact"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="userForm.password"
                  label="كلمة المرور"
                  type="password"
                  :rules="editingUser ? [] : [v => !!v || 'كلمة المرور مطلوبة', v => v.length >= 8 || 'كلمة المرور يجب أن تكون 8 أحرف على الأقل']"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="userForm.active"
                  label="حساب نشط"
                  color="primary"
                ></v-switch>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showAddUserDialog = false">إلغاء</v-btn>
          <v-btn
            color="primary"
            @click="saveUser"
            :loading="savingUser"
            :disabled="!userFormValid"
          >
            حفظ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View User Dialog -->
    <v-dialog v-model="showViewUserDialog" max-width="800">
      <v-card>
        <v-card-title class="dialog-title">
          تفاصيل المستخدم
        </v-card-title>
        <v-card-text>
          <div class="user-details" v-if="selectedUser">
            <div class="user-profile">
              <v-avatar size="80" class="profile-avatar">
                <img :src="selectedUser.avatar || '/default-avatar.png'" :alt="selectedUser.name" />
              </v-avatar>
              <div class="profile-info">
                <h3>{{ selectedUser.name }}</h3>
                <p>{{ selectedUser.email }}</p>
                <v-chip :color="getRoleColor(selectedUser.role)" size="small">
                  {{ getRoleLabel(selectedUser.role) }}
                </v-chip>
              </div>
            </div>
            
            <div class="user-stats">
              <div class="stat-item">
                <span class="stat-label">تاريخ الإنشاء:</span>
                <span class="stat-value">{{ formatDate(selectedUser.created_at) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">آخر تسجيل دخول:</span>
                <span class="stat-value">{{ selectedUser.last_login ? formatDate(selectedUser.last_login) : 'لم يسجل دخوله' }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">الحالة:</span>
                <v-chip :color="selectedUser.active ? 'success' : 'error'" size="small">
                  {{ selectedUser.active ? 'نشط' : 'غير نشط' }}
                </v-chip>
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showViewUserDialog = false">إغلاق</v-btn>
          <v-btn color="primary" @click="editUser(selectedUser)">تعديل</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Sync Results Dialog -->
    <v-dialog v-model="showSyncResults" max-width="500">
      <v-card>
        <v-card-title class="dialog-title">
          نتائج المزامنة
        </v-card-title>
        <v-card-text>
          <div class="sync-results" v-if="syncResults">
            <div class="result-item">
              <span class="result-label">⏱️ الوقت:</span>
              <span class="result-value">{{ (syncResults.stats.timeMs / 1000).toFixed(1) }} ث</span>
            </div>
            <div class="result-item">
              <span class="result-label">👥 إضافات:</span>
              <span class="result-value" style="color: #2196f3">{{ syncResults.stats.created }}</span>
            </div>
            <div class="result-item">
              <span class="result-label">🔄 تحديثات:</span>
              <span class="result-value" style="color: #ff9800">{{ syncResults.stats.updated }}</span>
            </div>
            <div class="result-item" v-if="syncResults.stats.failed > 0">
              <span class="result-label">❌ فشل:</span>
              <span class="result-value" style="color: #f44336">{{ syncResults.stats.failed }}</span>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showSyncResults = false">إغلاق</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';

const store = useStore();
const { t } = useI18n();

// Reactive data
const loading = ref(false);
const users = ref([]);
const searchQuery = ref('');
const selectedFilters = ref([]);
const showAddUserDialog = ref(false);
const showViewUserDialog = ref(false);
const showSyncResults = ref(false);
const editingUser = ref(null);
const selectedUser = ref(null);
const syncing = ref(false);
const savingUser = ref(false);
const userFormValid = ref(false);
const syncResults = ref(null);

// User form
const userForm = ref({
  name: '',
  email: '',
  phone: '',
  role: '',
  password: '',
  active: true
});

// Table headers
const tableHeaders = [
  { title: 'الصورة', key: 'avatar', sortable: false },
  { title: 'الاسم', key: 'name' },
  { title: 'الدور', key: 'role' },
  { title: 'الحالة', key: 'status' },
  { title: 'آخر تسجيل دخول', key: 'last_login' },
  { title: 'الإجراءات', key: 'actions', sortable: false }
];

// Available filters
const availableFilters = [
  { label: 'نشط', value: 'active', icon: 'mdi-account-check' },
  { label: 'غير نشط', value: 'inactive', icon: 'mdi-account-off' },
  { label: 'مدير', value: 'admin', icon: 'mdi-account-tie' },
  { label: 'مستخدم', value: 'user', icon: 'mdi-account' }
];

// Role options
const roleOptions = [
  { label: 'مدير', value: 'admin' },
  { label: 'مستخدم', value: 'user' },
  { label: 'مشرف', value: 'moderator' }
];

// User form reference
const userFormRef = ref(null);

// Computed properties
const filteredUsers = computed(() => {
  let filtered = users.value;

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.phone?.toLowerCase().includes(query)
    );
  }

  // Apply role filters
  if (selectedFilters.value.length > 0) {
    filtered = filtered.filter(user => {
      if (selectedFilters.value.includes('active') && user.active) return true;
      if (selectedFilters.value.includes('inactive') && !user.active) return true;
      if (selectedFilters.value.includes('admin') && user.role === 'admin') return true;
      if (selectedFilters.value.includes('user') && user.role === 'user') return true;
      return false;
    });
  }

  return filtered;
});

const userStats = computed(() => [
  {
    label: 'إجمالي المستخدمين',
    value: users.value.length,
    icon: 'mdi-account-group',
    color: '#2196f3',
    trend: 12
  },
  {
    label: 'مستخدمين نشطين',
    value: users.value.filter(u => u.active).length,
    icon: 'mdi-account-check',
    color: '#4caf50',
    trend: 8
  },
  {
    label: 'مديرين',
    value: users.value.filter(u => u.role === 'admin').length,
    icon: 'mdi-account-tie',
    color: '#ff9800',
    trend: -2
  },
  {
    label: 'مستخدمين جدد',
    value: users.value.filter(u => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return new Date(u.created_at) > thirtyDaysAgo;
    }).length,
    icon: 'mdi-account-plus',
    color: '#9c27b0',
    trend: 25
  }
]);

// Methods
const fetchUsers = async () => {
  loading.value = true;
  try {
    // Mock data for now
    users.value = [
      {
        id: 1,
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        phone: '+213 123 456 789',
        role: 'admin',
        active: true,
        avatar: '/avatars/user1.jpg',
        created_at: '2024-01-15T10:30:00Z',
        last_login: '2024-04-01T14:20:00Z'
      },
      {
        id: 2,
        name: 'فاطمة علي',
        email: 'fatima@example.com',
        phone: '+213 987 654 321',
        role: 'user',
        active: true,
        avatar: '/avatars/user2.jpg',
        created_at: '2024-02-20T09:15:00Z',
        last_login: '2024-03-31T16:45:00Z'
      },
      {
        id: 3,
        name: 'محمد سعيد',
        email: 'mohamed@example.com',
        phone: '+213 555 123 456',
        role: 'user',
        active: false,
        avatar: '/avatars/user3.jpg',
        created_at: '2024-03-10T11:00:00Z',
        last_login: null
      }
    ];
  } catch (error) {
    console.error('Error fetching users:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: 'حدث خطأ أثناء جلب المستخدمين'
    });
  } finally {
    loading.value = false;
  }
};

const saveUser = async () => {
  if (!userFormValid.value) return;

  savingUser.value = true;
  try {
    if (editingUser.value) {
      // Update existing user
      const index = users.value.findIndex(u => u.id === editingUser.value.id);
      if (index !== -1) {
        users.value[index] = { ...users.value[index], ...userForm.value };
      }
    } else {
      // Add new user
      const newUser = {
        id: Date.now(),
        ...userForm.value,
        created_at: new Date().toISOString(),
        last_login: null
      };
      users.value.push(newUser);
    }

    showAddUserDialog.value = false;
    resetUserForm();
    
    store.dispatch('notifications/showNotification', {
      type: 'success',
      message: editingUser.value ? 'تم تحديث المستخدم بنجاح' : 'تم إضافة المستخدم بنجاح'
    });
  } catch (error) {
    console.error('Error saving user:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: 'حدث خطأ أثناء حفظ المستخدم'
    });
  } finally {
    savingUser.value = false;
  }
};

const editUser = (user) => {
  editingUser.value = user;
  userForm.value = { ...user };
  showAddUserDialog.value = true;
};

const viewUser = (user) => {
  selectedUser.value = user;
  showViewUserDialog.value = true;
};

const deleteUser = async (user) => {
  if (confirm(`هل أنت متأكد من حذف المستخدم "${user.name}"؟`)) {
    try {
      const index = users.value.findIndex(u => u.id === user.id);
      if (index !== -1) {
        users.value.splice(index, 1);
      }
      
      store.dispatch('notifications/showNotification', {
        type: 'success',
        message: 'تم حذف المستخدم بنجاح'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      store.dispatch('notifications/showNotification', {
        type: 'error',
        message: 'حدث خطأ أثناء حذف المستخدم'
      });
    }
  }
};

const syncUsers = async () => {
  syncing.value = true;
  try {
    // Mock sync process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    syncResults.value = {
      stats: {
        timeMs: 2000,
        created: 5,
        updated: 12,
        failed: 0
      }
    };
    
    showSyncResults.value = true;
    
    store.dispatch('notifications/showNotification', {
      type: 'success',
      message: 'تمت المزامنة بنجاح'
    });
  } catch (error) {
    console.error('Error syncing users:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: 'حدث خطأ أثناء المزامنة'
    });
  } finally {
    syncing.value = false;
  }
};

const resetUserForm = () => {
  userForm.value = {
    name: '',
    email: '',
    phone: '',
    role: '',
    password: '',
    active: true
  };
  editingUser.value = null;
};

const getRoleColor = (role) => {
  const colors = {
    admin: 'error',
    moderator: 'warning',
    user: 'primary'
  };
  return colors[role] || 'default';
};

const getRoleLabel = (role) => {
  const labels = {
    admin: 'مدير',
    moderator: 'مشرف',
    user: 'مستخدم'
  };
  return labels[role] || role;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Lifecycle
onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.users-manager {
  padding: 2rem;
  background: var(--bg-surface);
  min-height: 100vh;
}

.users-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

.header-right {
  display: flex;
  gap: 1rem;
}

.add-user-btn,
.sync-btn {
  min-width: 120px;
}

.users-content {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.stats-section {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.stat-trend.up {
  color: var(--success);
}

.stat-trend.down {
  color: var(--error);
}

.filters-section {
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-wrapper {
  flex: 1;
  min-width: 300px;
}

.search-field {
  max-width: 400px;
}

.filter-chips {
  display: flex;
  gap: 0.5rem;
}

.users-table-section {
  background: var(--bg-card);
  border-radius: 12px;
  overflow: hidden;
}

.users-table {
  border-radius: 12px;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-name {
  font-weight: 600;
  color: var(--text-primary);
}

.user-email {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.user-avatar {
  border: 2px solid var(--border-subtle);
}

.last-login {
  font-size: 0.875rem;
}

.no-login {
  color: var(--text-secondary);
  font-style: italic;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  min-width: 32px;
}

.dialog-title {
  font-size: 1.25rem;
  font-weight: 600;
  padding: 1.5rem;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.profile-avatar {
  border: 3px solid var(--primary);
}

.profile-info {
  flex: 1;
}

.profile-info h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.profile-info p {
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.user-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--bg-surface);
  border-radius: 8px;
}

.stat-label {
  font-weight: 500;
  color: var(--text-secondary);
}

.stat-value {
  font-weight: 600;
  color: var(--text-primary);
}

.sync-results {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--bg-surface);
  border-radius: 8px;
}

.result-label {
  font-weight: 500;
  color: var(--text-secondary);
}

.result-value {
  font-weight: 600;
  color: var(--text-primary);
}

/* Responsive Design */
@media (max-width: 960px) {
  .users-manager {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-right {
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-wrapper {
    min-width: auto;
  }
}

@media (max-width: 600px) {
  .users-header,
  .users-content {
    border-radius: 12px;
  }
}
</style>
