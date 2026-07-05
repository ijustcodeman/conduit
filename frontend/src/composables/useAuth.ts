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

/** Exposes shared authentication state and actions for the frontend. */
export function useAuth() {
  /** Logs in an existing user and stores the returned token. */
  async function login(payload: LoginPayload) {
    const response = await runAuthRequest(() =>
      apiRequest('/users/login', AuthResponseSchema, {
        method: 'POST',
        body: { user: LoginPayloadSchema.parse(payload) },
      }),
    );

    setAuthenticatedUser(response.user);
  }

  /** Registers a new user and stores the returned token. */
  async function register(payload: RegisterPayload) {
    const response = await runAuthRequest(() =>
      apiRequest('/users', AuthResponseSchema, {
        method: 'POST',
        body: { user: RegisterPayloadSchema.parse(payload) },
      }),
    );

    setAuthenticatedUser(response.user);
  }

  /** Updates the current user's account and refreshes local auth state. */
  async function updateCurrentUser(payload: UpdateUserPayload) {
    const response = await runAuthRequest(() =>
      apiRequest('/user', AuthResponseSchema, {
        method: 'PUT',
        body: { user: UpdateUserPayloadSchema.parse(payload) },
      }),
    );

    setAuthenticatedUser(response.user);
  }

  /** Loads the current user once when a stored token is available. */
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

  /** Clears all local authentication state. */
  function logout() {
    token.value = null;
    user.value = null;
    hasLoadedCurrentUser.value = true;
  }

  /** Clears authentication error messages from the shared state. */
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

/** Runs an auth request while managing loading and error state. */
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

/** Stores an authenticated user and its token in shared state. */
function setAuthenticatedUser(nextUser: User) {
  user.value = nextUser;
  token.value = nextUser.token;
  hasLoadedCurrentUser.value = true;
}
