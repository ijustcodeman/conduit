import { computed, ref, watch } from 'vue';
import { apiRequest, getErrorMessages, setTokenProvider } from '@/lib/api';
import {
  AuthResponseSchema,
  LoginPayloadSchema,
  RegisterPayloadSchema,
  UpdateUserPayloadSchema,
  type LoginPayload,
  type RegisterPayload,
  type UpdateUserPayload,
  type User,
} from '@/types/api';

const TOKEN_STORAGE_KEY = 'article.authToken';

const token = ref(localStorage.getItem(TOKEN_STORAGE_KEY));
const user = ref<User | null>(null);
const isLoading = ref(false);
const errorMessages = ref<string[]>([]);
const hasLoadedCurrentUser = ref(false);

setTokenProvider(() => token.value);

watch(token, nextToken => {
  if (nextToken) {
    localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
});

const isAuthenticated = computed(() => Boolean(token.value && user.value));

export function useAuth() {
  async function login(payload: LoginPayload) {
    const response = await runAuthRequest(() =>
      apiRequest('/users/login', AuthResponseSchema, {
        method: 'POST',
        body: { user: LoginPayloadSchema.parse(payload) },
      }),
    );

    setAuthenticatedUser(response.user);
  }

  async function register(payload: RegisterPayload) {
    const response = await runAuthRequest(() =>
      apiRequest('/users', AuthResponseSchema, {
        method: 'POST',
        body: { user: RegisterPayloadSchema.parse(payload) },
      }),
    );

    setAuthenticatedUser(response.user);
  }

  async function updateCurrentUser(payload: UpdateUserPayload) {
    const response = await runAuthRequest(() =>
      apiRequest('/user', AuthResponseSchema, {
        method: 'PUT',
        body: { user: UpdateUserPayloadSchema.parse(payload) },
      }),
    );

    setAuthenticatedUser(response.user);
  }

  async function loadCurrentUser() {
    if (!token.value || hasLoadedCurrentUser.value) {
      hasLoadedCurrentUser.value = true;
      return;
    }

    try {
      isLoading.value = true;
      errorMessages.value = [];
      const response = await apiRequest('/user', AuthResponseSchema);
      user.value = response.user;
    } catch (error) {
      logout();
      errorMessages.value = getErrorMessages(error);
    } finally {
      isLoading.value = false;
      hasLoadedCurrentUser.value = true;
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    hasLoadedCurrentUser.value = true;
  }

  function clearErrors() {
    errorMessages.value = [];
  }

  return {
    token,
    user,
    isAuthenticated,
    isLoading,
    errorMessages,
    hasLoadedCurrentUser,
    login,
    register,
    updateCurrentUser,
    loadCurrentUser,
    logout,
    clearErrors,
  };
}

async function runAuthRequest<T>(request: () => Promise<T>): Promise<T> {
  try {
    isLoading.value = true;
    errorMessages.value = [];
    return await request();
  } catch (error) {
    errorMessages.value = getErrorMessages(error);
    throw error;
  } finally {
    isLoading.value = false;
  }
}

function setAuthenticatedUser(nextUser: User) {
  user.value = nextUser;
  token.value = nextUser.token;
  hasLoadedCurrentUser.value = true;
}
