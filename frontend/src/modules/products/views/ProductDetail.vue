<template>
  <div class="product-detail">
    <v-container v-if="loading" class="py-16">
      <v-row justify="center">
        <v-col cols="12" md="8">
          <v-card>
            <v-card-text class="pa-8">
              <div class="text-center">
                <v-progress-circular
                  indeterminate
                  color="warning"
                  size="64"
                ></v-progress-circular>
                <div class="mt-4">
                  <h3 class="text-h5">{{ $t('loading') }}</h3>
                  <p class="text-body-1">{{ $t('loadingProduct') }}</p>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-alert
      v-else-if="error"
      type="error"
      prominent
      class="ma-4"
    >
      <v-alert-title>{{ $t('error') }}</v-alert-title>
      {{ error }}
    </v-alert>

    <!-- Product Content -->
    <v-container v-else-if="product">
      <v-row>
        <v-col cols="12" md="6">
          <v-card elevation="2" class="rounded-3xl pa-4">
            <v-img
              :src="product.image"
              :alt="product.name"
              height="420"
              class="rounded-2xl"
              cover
            >
              <template #placeholder>
                <v-skeleton-loader type="image"></v-skeleton-loader>
              </template>
            </v-img>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card elevation="4" class="rounded-3xl pa-6 pa-md-8 sticky top-24">
            <v-card-text>
              <!-- Product Title and Price -->
              <div class="mb-6">
                <h1 class="text-h3 font-weight-bold mb-2">{{ product.name }}</h1>
                <p class="text-body-1 text-medium-emphasis mb-4">{{ product.description }}</p>
                
                <!-- Price -->
                <div class="text-h3 font-weight-black text-warning mb-4">
                  {{ formatPrice(product.price) }}
                </div>
              </div>

              <!-- Product Tags -->
              <div class="d-flex flex-wrap gap-2 mb-4">
                <v-chip
                  v-for="tag in product.tags"
                  :key="tag"
                  variant="outlined"
                  color="grey-lighten-2"
                  size="small"
                  class="text-none"
                >
                  {{ tag }}
                </v-chip>
              </div>

              <!-- Product Actions -->
              <div class="d-flex gap-3 mb-6">
                <v-btn
                  color="warning"
                  size="large"
                  prepend-icon="mdi-cart-plus"
                  class="flex-grow-1"
                  @click="addToCart"
                >
                  {{ $t('addToCart') }}
                </v-btn>
                <v-btn
                  color="secondary"
                  icon="mdi-heart-outline"
                  variant="outlined"
                  @click="toggleWishlist"
                >
                </v-btn>
              </div>

              <!-- Product Details -->
              <div class="product-details mb-6">
                <h3 class="text-h6 font-weight-bold mb-3">{{ $t('productDetails') }}</h3>
                <v-row>
                  <v-col cols="6" class="mb-3">
                    <div class="text-caption text-medium-emphasis">{{ $t('category') }}</div>
                    <div class="text-body-2">{{ product.category }}</div>
                  </v-col>
                  <v-col cols="6" class="mb-3">
                    <div class="text-caption text-medium-emphasis">{{ $t('material') }}</div>
                    <div class="text-body-2">{{ product.material }}</div>
                  </v-col>
                  <v-col cols="6" class="mb-3">
                    <div class="text-caption text-medium-emphasis">{{ $t('dimensions') }}</div>
                    <div class="text-body-2">{{ product.dimensions }}</div>
                  </v-col>
                  <v-col cols="6" class="mb-3">
                    <div class="text-caption text-medium-emphasis">{{ $t('weight') }}</div>
                    <div class="text-body-2">{{ product.weight }}</div>
                  </v-col>
                </v-row>
              </div>

              <!-- AI Smart Measurement -->
              <div class="ai-measurement mb-6">
                <h3 class="text-h6 font-weight-bold mb-3">{{ $t('aiSmartMeasurement') }}</h3>
                <v-text-field
                  v-model="referenceDimension"
                  type="number"
                  :label="$t('referenceDimension')"
                  variant="outlined"
                  color="warning"
                  min="10"
                  class="mb-3"
                ></v-text-field>
                <v-file-input
                  accept="image/*"
                  :label="$t('uploadImage')"
                  variant="outlined"
                  color="warning"
                  prepend-icon="mdi-camera"
                  @change="onImageChange"
                  class="mb-3"
                ></v-file-input>
                <v-btn
                  @click="runSmartMeasurement"
                  color="warning"
                  variant="tonal"
                  prepend-icon="mdi-brain"
                  :loading="aiLoading"
                  :disabled="!aiImageFile"
                  block
                >
                  {{ aiLoading ? $t('calculating') : $t('calculateWithAI') }}
                </v-btn>
              </div>

              <!-- AI Results -->
              <div v-if="aiResults" class="ai-results mb-6">
                <h3 class="text-h6 font-weight-bold mb-3">{{ $t('measurementResults') }}</h3>
                <v-alert type="success" variant="tonal">
                  <div class="mb-2">
                    <strong>{{ $t('estimatedArea') }}:</strong> {{ aiResults.area }} m²
                  </div>
                  <div>
                    <strong>{{ $t('estimatedPrice') }}:</strong> {{ formatPrice(aiResults.price) }}
                  </div>
                </v-alert>
              </div>

              <!-- Shipping Info -->
              <div class="shipping-info mb-6">
                <h3 class="text-h6 font-weight-bold mb-3">{{ $t('shippingInfo') }}</h3>
                <v-row>
                  <v-col cols="6" class="mb-3">
                    <div class="text-caption text-medium-emphasis">{{ $t('deliveryTime') }}</div>
                    <div class="text-body-2">{{ product.deliveryTime }}</div>
                  </v-col>
                  <v-col cols="6" class="mb-3">
                    <div class="text-caption text-medium-emphasis">{{ $t('shippingCost') }}</div>
                    <div class="text-body-2">{{ formatPrice(product.shippingCost) }}</div>
                  </v-col>
                </v-row>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const router = useRouter();
const store = useStore();
const { t } = useI18n();

// Reactive data
const loading = ref(true);
const error = ref(null);
const product = ref(null);
const referenceDimension = ref(null);
const aiImageFile = ref(null);
const aiLoading = ref(false);
const aiResults = ref(null);

// Computed
const productId = computed(() => route.params.id);

// Methods
const fetchProduct = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // Dynamic API call
    const response = await fetch(`/api/products/${productId.value}`);
    if (response.ok) {
      const data = await response.json();
      product.value = {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image_url || 'https://i.postimg.cc/7L0DfPgY/Entrance1.png',
        category: data.category?.name || 'ديكور',
        material: data.material || 'فينيل عالي الجودة',
        dimensions: data.dimensions || '60x120 سم',
        weight: data.weight || '0.5 كجم',
        tags: data.tags || ['جديد', 'مميز'],
        deliveryTime: data.delivery_time || '3-5 أيام',
        shippingCost: data.shipping_cost || 500
      };
    } else {
      throw new Error('Product not found');
    }
  } catch (err) {
    console.error('Error fetching product:', err);
    error.value = t('productNotFound');
  } finally {
    loading.value = false;
  }
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD'
  }).format(price);
};

const addToCart = () => {
  if (!product.value) return;
  
  store.dispatch('cart/addItem', {
    id: product.value.id,
    name: product.value.name,
    price: product.value.price,
    image: product.value.image,
    quantity: 1
  });
  
  store.dispatch('notifications/showNotification', {
    type: 'success',
    message: t('addedToCart')
  });
};

const toggleWishlist = () => {
  if (!product.value) return;
  
  store.dispatch('wishlist/toggleItem', product.value);
  
  store.dispatch('notifications/showNotification', {
    type: 'success',
    message: product.value.inWishlist ? t('removedFromWishlist') : t('addedToWishlist')
  });
};

const onImageChange = (event) => {
  aiImageFile.value = event.target.files[0];
  aiResults.value = null;
};

const runSmartMeasurement = async () => {
  if (!aiImageFile.value || !referenceDimension.value) return;
  
  aiLoading.value = true;
  
  try {
    // Mock AI calculation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const area = Math.random() * 10 + 5; // Random area between 5-15 m²
    const price = area * product.value.price * 0.8; // Calculate based on area
    
    aiResults.value = {
      area: area.toFixed(2),
      price: price
    };
    
    store.dispatch('notifications/showNotification', {
      type: 'success',
      message: t('measurementCalculated')
    });
  } catch (err) {
    console.error('AI measurement error:', err);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('measurementError')
    });
  } finally {
    aiLoading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  fetchProduct();
});
</script>

<style scoped>
.product-detail {
  background: var(--bg-surface);
  min-height: 100vh;
}

.sticky {
  position: sticky;
  top: 24px;
}

.ai-measurement,
.ai-results,
.shipping-info {
  background: var(--bg-deep);
  border-radius: 12px;
  padding: 1.5rem;
}

.ai-results .v-alert {
  border-radius: 8px;
}

/* Responsive */
@media (max-width: 960px) {
  .sticky {
    position: static;
    top: 0;
  }
}
</style>
