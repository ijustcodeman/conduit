import { computed, reactive, ref, watch, type Ref } from 'vue';
import { apiRequest, getErrorMessages } from '@/lib/api';
import {
  ArticlePayloadSchema,
  ArticleResponseSchema,
  UpdateArticlePayloadSchema,
  type Article,
} from '@/types/api';

export function useArticleEditor(slug: Ref<string | null>) {
  const form = reactive({
    title: '',
    description: '',
    body: '',
    tags: '',
  });
  const article = ref<Article | null>(null);
  const isLoading = ref(false);
  const isSaving = ref(false);
  const errorMessages = ref<string[]>([]);

  const isEditing = computed(() => Boolean(slug.value));

  watch(
    slug,
    () => {
      resetForm();

      if (slug.value) {
        void loadArticle();
      }
    },
    { immediate: true },
  );

  async function loadArticle() {
    if (!slug.value) {
      return;
    }

    try {
      isLoading.value = true;
      errorMessages.value = [];
      const response = await apiRequest(
        `/articles/${slug.value}`,
        ArticleResponseSchema,
      );

      article.value = response.article;
      form.title = response.article.title;
      form.description = response.article.description;
      form.body = response.article.body;
      form.tags = response.article.tagList.join(', ');
    } catch (error) {
      errorMessages.value = getErrorMessages(error);
    } finally {
      isLoading.value = false;
    }
  }

  async function saveArticle() {
    try {
      isSaving.value = true;
      errorMessages.value = [];

      const response = isEditing.value
        ? await updateArticle()
        : await createArticle();

      article.value = response.article;
      return response.article;
    } catch (error) {
      errorMessages.value = getErrorMessages(error);
      throw error;
    } finally {
      isSaving.value = false;
    }
  }

  async function createArticle() {
    return apiRequest('/articles', ArticleResponseSchema, {
      method: 'POST',
      body: {
        article: ArticlePayloadSchema.parse({
          title: form.title,
          description: form.description,
          body: form.body,
          tagList: parseTags(form.tags),
        }),
      },
    });
  }

  async function updateArticle() {
    return apiRequest(`/articles/${slug.value}`, ArticleResponseSchema, {
      method: 'PUT',
      body: {
        article: UpdateArticlePayloadSchema.parse({
          title: form.title,
          description: form.description,
          body: form.body,
        }),
      },
    });
  }

  function resetForm() {
    article.value = null;
    form.title = '';
    form.description = '';
    form.body = '';
    form.tags = '';
    errorMessages.value = [];
  }

  return {
    form,
    article,
    isEditing,
    isLoading,
    isSaving,
    errorMessages,
    loadArticle,
    saveArticle,
    resetForm,
  };
}

function parseTags(tags: string) {
  return tags
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean);
}
