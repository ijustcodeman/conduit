import { ref } from 'vue';
import { apiRequest, getErrorMessages } from '@/lib/api';
import { TagsResponseSchema } from '@/types/api';

export function useTags() {
  const tags = ref<string[]>([]);
  const isLoading = ref(false);
  const errorMessages = ref<string[]>([]);

  async function fetchTags() {
    try {
      isLoading.value = true;
      errorMessages.value = [];
      const response = await apiRequest('/tags', TagsResponseSchema);
      tags.value = response.tags;
    } catch (error) {
      tags.value = [];
      errorMessages.value = getErrorMessages(error);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    tags,
    isLoading,
    errorMessages,
    fetchTags,
  };
}
