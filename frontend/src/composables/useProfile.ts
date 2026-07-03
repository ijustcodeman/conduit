import { ref, watch, type Ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { apiRequest, getErrorMessages } from '@/lib/api';
import { ProfileResponseSchema, type Profile } from '@/types/api';

export function useProfile(username: Ref<string>) {
  const auth = useAuth();
  const router = useRouter();
  const profile = ref<Profile | null>(null);
  const isLoading = ref(false);
  const isFollowPending = ref(false);
  const errorMessages = ref<string[]>([]);
  let requestId = 0;

  watch(
    username,
    () => {
      void fetchProfile();
    },
    { immediate: true },
  );

  async function fetchProfile() {
    const currentRequestId = ++requestId;

    try {
      isLoading.value = true;
      errorMessages.value = [];
      const response = await apiRequest(
        `/profiles/${username.value}`,
        ProfileResponseSchema,
      );

      if (currentRequestId === requestId) {
        profile.value = response.profile;
      }
    } catch (error) {
      if (currentRequestId === requestId) {
        profile.value = null;
        errorMessages.value = getErrorMessages(error);
      }
    } finally {
      if (currentRequestId === requestId) {
        isLoading.value = false;
      }
    }
  }

  async function toggleFollow() {
    if (!profile.value) {
      return;
    }

    if (!auth.isAuthenticated.value) {
      await router.push({
        name: 'login',
        query: { redirect: `/profile/${profile.value.username}` },
      });
      return;
    }

    try {
      isFollowPending.value = true;
      errorMessages.value = [];

      const response = await apiRequest(
        `/profiles/${profile.value.username}/follow`,
        ProfileResponseSchema,
        {
          method: profile.value.following ? 'DELETE' : 'POST',
        },
      );

      profile.value = response.profile;
    } catch (error) {
      errorMessages.value = getErrorMessages(error);
    } finally {
      isFollowPending.value = false;
    }
  }

  return {
    profile,
    isLoading,
    isFollowPending,
    errorMessages,
    fetchProfile,
    toggleFollow,
  };
}
