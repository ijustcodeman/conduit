import { ref, watch, type Ref } from 'vue';
import * as z from 'zod';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { apiRequest, getErrorMessages } from '@/lib/api';
import { ArticleResponseSchema, type Article } from '@/types/api';

export function useArticle(slug: Ref<string>) {
  const auth = useAuth();
  const router = useRouter();
  const article = ref<Article | null>(null);
  const isLoading = ref(false);
  const isFavoritePending = ref(false);
  const isDeleting = ref(false);
  const errorMessages = ref<string[]>([]);
  let requestId = 0;

  watch(
    slug,
    () => {
      void fetchArticle();
    },
    { immediate: true },
  );

  async function fetchArticle() {
    const currentRequestId = ++requestId;

    try {
      isLoading.value = true;
      errorMessages.value = [];
      const response = await apiRequest(
        `/articles/${slug.value}`,
        ArticleResponseSchema,
      );

      if (currentRequestId === requestId) {
        article.value = response.article;
      }
    } catch (error) {
      if (currentRequestId === requestId) {
        article.value = null;
        errorMessages.value = getErrorMessages(error);
      }
    } finally {
      if (currentRequestId === requestId) {
        isLoading.value = false;
      }
    }
  }

  async function toggleFavorite() {
    if (!article.value) {
      return;
    }

    if (!auth.isAuthenticated.value) {
      await router.push({
        name: 'login',
        query: { redirect: `/article/${article.value.slug}` },
      });
      return;
    }

    try {
      isFavoritePending.value = true;
      errorMessages.value = [];

      const response = await apiRequest(
        `/articles/${article.value.slug}/favorite`,
        ArticleResponseSchema,
        {
          method: article.value.favorited ? 'DELETE' : 'POST',
        },
      );

      article.value = response.article;
    } catch (error) {
      errorMessages.value = getErrorMessages(error);
    } finally {
      isFavoritePending.value = false;
    }
  }

  async function deleteArticle() {
    if (!article.value) {
      return;
    }

    try {
      isDeleting.value = true;
      errorMessages.value = [];

      await apiRequest(`/articles/${article.value.slug}`, z.undefined(), {
        method: 'DELETE',
      });

      await router.push({ name: 'home' });
    } catch (error) {
      errorMessages.value = getErrorMessages(error);
    } finally {
      isDeleting.value = false;
    }
  }

  return {
    article,
    isLoading,
    isFavoritePending,
    isDeleting,
    errorMessages,
    fetchArticle,
    toggleFavorite,
    deleteArticle,
  };
}
