<template>
  <v-main class="checkout-page">
    <!-- Background Effects -->
    <div class="bg-effects">
      <v-overlay 
        v-model="overlayActive" 
        class="gradient-overlay" 
        persistent 
        opacity="0.1"
      />
      <div class="floating-orb orb-1"></div>
      <div class="floating-orb orb-2"></div>
      <div class="floating-orb orb-3"></div>
    </div>

    <v-container>
      <v-card class="glass-card" elevation="8">
        <!-- Header -->
        <v-card-title class="pa-6">
          <h1 class="text-h4 font-weight-bold">
            <v-icon class="me-2">mdi-credit-card</v-icon>
            {{ $t('checkout') || 'الدفع' }}
          </h1>
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-6">
          <v-row>
            <!-- Billing Details -->
            <v-col cols="12" md="7">
              <v-card class="billing-card" elevation="2">
                <v-card-title class="text-h6">
                  <v-icon class="me-2">mdi-account-details</v-icon>
                  {{ $t('billingDetails') || 'تفاصيل الشحن والدفع' }}
                </v-card-title>
                
                <v-divider />

                <v-card-text>
                  <v-form ref="checkoutForm" v-model="formValid">
                    <v-row>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          v-model="form.firstName"
                          :label="$t('firstName') || 'الاسم الأول'"
                          variant="outlined"
                          :rules="[v => !!v || 'هذا الحقل مطلوب']"
                          required
                        />
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          v-model="form.lastName"
                          :label="$t('lastName') || 'الاسم الأخير'"
                          variant="outlined"
                          :rules="[v => !!v || 'هذا الحقل مطلوب']"
                          required
                        />
                      </v-col>
                      <v-col cols="12">
                        <v-text-field
                          v-model="form.email"
                          :label="$t('email')"
                          variant="outlined"
                          type="email"
                          :rules="[v => !!v || 'هذا الحقل مطلوب', v => /.+@.+\..+/.test(v) || 'بريد إلكتروني غير صالح']"
                          required
                        />
                      </v-col>
                      <v-col cols="12">
                        <v-text-field
                          v-model="form.phone"
                          :label="$t('phone')"
                          variant="outlined"
                          type="tel"
                          :placeholder="$t('phonePlaceholder') || '05 / 06 / 07 ...'"
                          :rules="[v => !!v || 'هذا الحقل مطلوب', v => /^(05|06|07)\d{8}$/.test(v) || 'رقم هاتف غير صالح']"
                          required
                        />
                      </v-col>
                      <v-col cols="12" sm="8">
                        <v-text-field
                          v-model="form.address"
                          :label="$t('address')"
                          variant="outlined"
                          :rules="[v => !!v || 'هذا الحقل مطلوب']"
                          required
                        />
                      </v-col>
                      <v-col cols="12" sm="4">
                        <v-select
                          v-model="form.wilaya"
                          :label="$t('wilaya') || 'الولاية'"
                          :items="wilayas"
                          item-title="name"
                          item-value="id"
                          variant="outlined"
                          :rules="[v => !!v || 'هذا الحقل مطلوب']"
                          required
                        />
                      </v-col>
                    </v-row>

                    <!-- Payment Method -->
                    <v-divider class="my-4" />
                    
                    <h6 class="text-h6 mb-4">{{ $t('paymentMethod') || 'طريقة الدفع' }}</h6>
                    
                    <v-radio-group v-model="form.paymentMethod" class="payment-methods">
                      <v-radio 
                        v-for="method in paymentMethods" 
                        :key="method.value"
                        :value="method.value"
                        class="payment-option"
                      >
                        <template v-slot:label>
                          <div class="d-flex align-center">
                            <v-icon :icon="method.icon" class="me-3" />
                            <div>
                              <div class="text-body-1">{{ method.label }}</div>
                              <div class="text-caption text-medium-emphasis">{{ method.description }}</div>
                            </div>
                          </div>
                        </template>
                      </v-radio>
                    </v-radio-group>

                    <!-- Order Notes -->
                    <v-divider class="my-4" />
                    
                    <v-textarea
                      v-model="form.notes"
                      :label="$t('orderNotes') || 'ملاحظات الطلب'"
                      variant="outlined"
                      rows="3"
                      :placeholder="$t('orderNotesPlaceholder') || 'أي ملاحظات خاصة بالطلب...'"
                    />
                  </v-form>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Order Summary -->
            <v-col cols="12" md="5">
              <v-card class="order-summary-card" elevation="2">
                <v-card-title class="text-h6">
                  <v-icon class="me-2">mdi-receipt</v-icon>
                  {{ $t('orderSummary') || 'ملخص الطلب' }}
                </v-card-title>
                
                <v-divider />

                <v-card-text>
                  <!-- Cart Items -->
                  <div class="cart-items mb-4">
                    <v-list density="compact">
                      <v-list-item
                        v-for="item in cartItems"
                        :key="item.id"
                        class="cart-summary-item"
                      >
                        <template v-slot:prepend>
                          <v-avatar size="40" rounded>
                            <v-img
                              :src="item.image"
                              :alt="item.name"
                              cover
                            />
                          </v-avatar>
                        </template>

                        <v-list-item-content>
                          <v-list-item-title class="text-body-2">{{ item.name }}</v-list-item-title>
                          <v-list-item-subtitle class="text-caption">
                            {{ $t('quantity') || 'الكمية' }}: {{ item.quantity }}
                          </v-list-item-subtitle>
                        </v-list-item-content>

                        <template v-slot:append>
                          <span class="text-body-2 font-weight-bold">
                            {{ formatCurrency(item.price * item.quantity) }}
                          </span>
                        </template>
                      </v-list-item>
                    </v-list>
                  </div>

                  <!-- Price Summary -->
                  <v-divider class="my-3" />
                  
                  <v-list density="compact">
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon>mdi-shopping-bag</v-icon>
                      </template>
                      <v-list-item-title>{{ $t('subtotal') || 'المجموع الفرعي' }}</v-list-item-title>
                      <template v-slot:append>
                        <span class="text-body-2">{{ formatCurrency(subtotal) }}</span>
                      </template>
                    </v-list-item>
                    
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon>mdi-truck</v-icon>
                      </template>
                      <v-list-item-title>{{ $t('shipping') || 'الشحن' }}</v-list-item-title>
                      <template v-slot:append>
                        <span class="text-body-2">{{ formatCurrency(shippingCost) }}</span>
                      </template>
                    </v-list-item>
                    
                    <v-list-item v-if="discountAmount > 0">
                      <template v-slot:prepend>
                        <v-icon>mdi-tag</v-icon>
                      </template>
                      <v-list-item-title>{{ $t('discount') || 'الخصم' }}</v-list-item-title>
                      <template v-slot:append>
                        <span class="text-body-2 text-success">-{{ formatCurrency(discountAmount) }}</span>
                      </template>
                    </v-list-item>
                    
                    <v-divider class="my-2" />
                    
                    <v-list-item>
                      <v-list-item-title class="text-h6 font-weight-bold">
                        {{ $t('total') || 'الإجمالي' }}
                      </v-list-item-title>
                      <template v-slot:append>
                        <span class="text-h5 font-weight-bold text-primary">{{ formatCurrency(total) }}</span>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card-text>

                <v-divider />

                <!-- Submit Button -->
                <v-card-actions class="pa-4">
                  <v-btn
                    color="primary"
                    variant="elevated"
                    size="large"
                    block
                    prepend-icon="mdi-check"
                    @click="submitOrder"
                    :loading="submitting"
                    :disabled="!formValid || cartItems.length === 0"
                  >
                    {{ $t('placeOrder') || 'تأكيد الطلب' }}
                  </v-btn>
                </v-card-actions>

                <!-- Security Note -->
                <v-card-text class="text-center text-caption text-medium-emphasis">
                  <v-icon size="small" class="me-1">mdi-shield-check</v-icon>
                  {{ $t('securePayment') || 'دفع آمن ومشفر' }}
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>
  </v-main>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/store/auth'
import CartService from '@/integration/services/CartService'
import CheckoutService from '@/integration/services/CheckoutService'
import AddressService from '@/integration/services/AddressService'
import NotificationService from '@/integration/services/NotificationService'

// Reactive data
const overlayActive = ref(true);
const submitting = ref(false);
const formValid = ref(false);
const checkoutForm = ref(null);
const cartItems = ref([]);
const router = useRouter();

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  wilaya: '',
  paymentMethod: 'cash_on_delivery',
  notes: ''
});

// Wilayas - Dynamic loading from API
const wilayas = ref([]);

// Payment Methods - Dynamic loading from API
const paymentMethods = ref([]);

// Computed
const subtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

const shippingCost = computed(() => {
  return subtotal.value > 15000 ? 0 : 800;
});

const discountAmount = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    if (item.originalPrice) {
      return sum + ((item.originalPrice - item.price) * item.quantity);
    }
    return sum;
  }, 0);
});

const total = computed(() => {
  return subtotal.value + shippingCost.value - discountAmount.value;
});

// Methods
const fetchWilayas = async () => {
  try {
    const response = await fetch('/api/locations/wilayas');
    if (response.ok) {
      const data = await response.json();
      wilayas.value = data.map(wilaya => ({
        id: wilaya.id,
        name: wilaya.name
      }));
    }
  } catch (error) {
    console.error('Failed to fetch wilayas:', error);
    wilayas.value = [
      { id: '1', name: 'أدرار' },
      { id: '2', name: 'الشلف' },
      { id: '3', name: 'الأغواط' },
      { id: '4', name: 'أم البواقي' },
      { id: '5', name: 'باتنة' },
      { id: '6', name: 'بجاية' },
      { id: '7', name: 'بسكرة' },
      { id: '8', name: 'بشار' },
      { id: '9', name: 'البليدة' },
      { id: '10', name: 'البويرة' },
      { id: '11', name: 'تمنراست' },
      { id: '12', name: 'تبسة' },
      { id: '13', name: 'تلمسان' },
      { id: '14', name: 'تيارت' },
      { id: '15', name: 'تيزي وزو' },
      { id: '16', name: 'الجزائر' },
      { id: '17', name: 'الجلفة' },
      { id: '18', name: 'جيجل' },
      { id: '19', name: 'سوق أهراس' },
      { id: '20', name: 'سيدي بلعباس' },
      { id: '21', name: 'عنابة' },
      { id: '22', name: 'قالمة' },
      { id: '23', name: 'قسنطينة' },
      { id: '24', name: 'المدية' },
      { id: '25', name: 'ميلة' },
      { id: '26', name: 'معسكر' },
      { id: '27', name: 'مسردة' },
      { id: '28', name: 'مستغانم' },
      { id: '29', name: 'المسيلة' },
      { id: '30', name: 'ورقلة' },
      { id: '31', name: 'وهران' },
      { id: '32', name: 'البيض' },
      { id: '33', name: 'إليزي' },
      { id: '34', name: 'برج بوعريريج' },
      { id: '35', name: 'بومرداس' },
      { id: '36', name: 'الطارف' },
      { id: '37', name: 'تندوف' },
      { id: '38', name: 'تميمون' },
      { id: '39', name: 'غرداية' },
      { id: '40', name: 'غليزان' },
      { id: '41', name: 'قايدي بلعباس' },
      { id: '42', name: 'خنشلة' },
      { id: '43', name: 'سطيف' },
      { id: '44', name: 'عين الدفلى' },
      { id: '45', name: 'النعامة' },
      { id: '46', name: 'عين تموشنت' },
      { id: '47', name: 'غرداية' },
      { id: '48', name: 'غليزان' },
      { id: '54', name: 'المنطقة' },
      { id: '55', name: 'نعامة' },
      { id: '56', name: 'تيميمون' },
      { id: '57', name: 'برج بوعريريج' },
      { id: '58', name: 'تلمسان' }
    ];
  }
};

const fetchPaymentMethods = async () => {
  try {
    const response = await fetch('/api/payment-methods');
    if (response.ok) {
      const data = await response.json();
      paymentMethods.value = data.map(method => ({
        value: method.value,
        label: method.label,
        description: method.description,
        icon: method.icon || 'mdi-credit-card'
      }));
    }
  } catch (error) {
    console.error('Failed to fetch payment methods:', error);
    paymentMethods.value = [
      {
        value: 'cash_on_delivery',
        label: 'الدفع عند الاستلام',
        description: 'الدفع عند استلام المنتجات',
        icon: 'mdi-cash'
      },
      {
        value: 'credit_card',
        label: 'بطاقة بنكية',
        description: 'الدفع الآمن بالبطاقة البنكية',
        icon: 'mdi-credit-card'
      },
      {
        value: 'cib',
        label: 'CIB',
        description: 'الدفع عبر CIB',
        icon: 'mdi-bank'
      },
      {
        value: 'edahabia',
        label: 'Edahabia',
        description: 'الدفع عبر محفظة Edahabia',
        icon: 'mdi-wallet'
      }
    ];
  }
};

const loadCart = async () => {
  try {
    const items = await CartService.getCartItems();
    cartItems.value = items;
    console.log('✅ Cart loaded for checkout:', items);
  } catch (error) {
    console.error('❌ Error loading cart:', error);
    cartItems.value = CartService.getFallbackCartItems();
  }
};

const submitOrder = async () => {
  if (!formValid.value) return;
  
  submitting.value = true;
  try {
    const orderData = {
      customer: {
        firstName: form.value.firstName,
        lastName: form.value.lastName,
        email: form.value.email,
        phone: form.value.phone
      },
      shipping: {
        address: form.value.address,
        wilaya: form.value.wilaya
      },
      payment: {
        method: form.value.paymentMethod
      },
      items: cartItems.value.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        variant: item.variant
      })),
      notes: form.value.notes,
      totals: {
        subtotal: subtotal.value,
        shippingCost: shippingCost.value,
        discountAmount: discountAmount.value,
        total: total.value
      }
    };

    const order = await CheckoutService.createOrder(orderData);
    
    console.log('✅ Order created successfully:', order);
    
    // Show success notification
    NotificationService.success(
      'تم تأكيد طلبك', 
      `الطلب رقم ${order.orderNumber || order.id} قيد المعالجة الآن. شكراً لك!`
    );
    
    // Clear cart
    localStorage.removeItem('cart');
    
    // Navigate to success page
    router.push(`/shop/order-success?orderId=${order.id || order.orderNumber}`);
    
  } catch (error) {
    console.error('❌ Error submitting order:', error);
    NotificationService.error(
      'فشل في إنشاء الطلب',
      error.message || 'حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.'
    );
  } finally {
    submitting.value = false;
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD'
  }).format(amount);
};

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadCart(),
    fetchWilayas(),
    fetchPaymentMethods()
  ]);
  
  if (cartItems.value.length === 0) {
    router.push('/shop');
  }
});
</script>

<style scoped>
.bg-effects {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.floating-orb {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, transparent 70%);
  animation: float 6s ease-in-out infinite;
}

.orb-1 {
  width: 300px;
  height: 300px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 200px;
  height: 200px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.orb-3 {
  width: 250px;
  height: 250px;
  bottom: 20%;
  left: 60%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.glass-card {
  background: rgba(var(--v-theme-surface), 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  border-radius: 24px;
  margin-top: 80px;
}

.cart-summary-item {
  transition: all 0.3s ease;
}

.cart-summary-item:hover {
  background: rgba(var(--v-theme-surface-variant), 0.05);
}

.payment-methods :deep(.v-radio) {
  margin-bottom: 16px;
}

.payment-option {
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
}

.payment-option:hover {
  border-color: var(--v-theme-primary);
  background: rgba(var(--v-theme-primary), 0.05);
}

@media (max-width: 768px) {
  .glass-card {
    margin-top: 20px;
    border-radius: 16px;
  }
}
</style>
