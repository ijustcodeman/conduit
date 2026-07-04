import { computed, ref, watch, type Ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { apiRequest, getErrorMessages } from '@/lib/api';
import {
  ArticleResponseSchema,
  ArticlesResponseSchema,
  type Article,
} from '@/types/api';

export type ArticleFeedMode = 'global' | 'personal';

type UseArticlesOptions = {
  feedMode: Ref<ArticleFeedMode>;
  selectedTag: Ref<string | null>;
  author?: Ref<string | null>;
  favorited?: Ref<string | null>;
};

const PAGE_SIZE = 10;

export function useArticles(options: UseArticlesOptions) {
  const auth = useAuth();
  const router = useRouter();
  const articles = ref<Article[]>([]);
  const articlesCount = ref(0);
  const offset = ref(0);
  const isLoading = ref(false);
  const errorMessages = ref<string[]>([]);
  const pendingFavoriteSlug = ref<string | null>(null);
  const authorFilter = options.author ?? ref<string | null>(null);
  const favoritedFilter = options.favorited ?? ref<string | null>(null);
  let requestId = 0;

  const page = computed(() => Math.floor(offset.value / PAGE_SIZE) + 1);
  const totalPages = computed(() =>
    Math.max(1, Math.ceil(articlesCount.value / PAGE_SIZE)),
  );
  const canGoPrevious = computed(() => offset.value > 0);
  const canGoNext = computed(() => offset.value + PAGE_SIZE < articlesCount.value);

  watch(
    [options.feedMode, options.selectedTag, authorFilter, favoritedFilter],
    () => {
      offset.value = 0;
    },
  );

  watch(
    [
      options.feedMode,
      options.selectedTag,
      authorFilter,
      favoritedFilter,
      offset,
    ],
    () => {
      void fetchArticles();
    },
    { immediate: true },
  );

  async function fetchArticles() {
    const currentRequestId = ++requestId;

    try {
      isLoading.value = true;
      errorMessages.value = [];

      const response = await apiRequest(
        options.feedMode.value === 'personal' ? '/articles/feed' : '/articles',
        ArticlesResponseSchema,
        {
          query: {
            limit: PAGE_SIZE,
            offset: offset.value,
            tag:
              options.feedMode.value === 'global'
                ? options.selectedTag.value ?? undefined
                : undefined,
            author:
              options.feedMode.value === 'global'
                ? authorFilter.value ?? undefined
                : undefined,
            favorited:
              options.feedMode.value === 'global'
                ? favoritedFilter.value ?? undefined
                : undefined,
          },
        },
      );

      if (currentRequestId !== requestId) {
        return;
      }

      articles.value = response.articles;
      articlesCount.value = response.articlesCount;
    } catch (error) {
      if (currentRequestId !== requestId) {
        return;
      }

      articles.value = [];
      articlesCount.value = 0;
      errorMessages.value = getErrorMessages(error);
    } finally {
      if (currentRequestId === requestId) {
        isLoading.value = false;
      }
    }
  }

  function goPrevious() {
    if (canGoPrevious.value) {
      offset.value = Math.max(0, offset.value - PAGE_SIZE);
    }
  }

  function goNext() {
    if (canGoNext.value) {
      offset.value += PAGE_SIZE;
    }
  }

  async function toggleFavorite(article: Article) {
    if (!auth.isAuthenticated.value) {
      await router.push({ name: 'login', query: { redirect: '/' } });
      return;
    }

    try {
      pendingFavoriteSlug.value = article.slug;
      errorMessages.value = [];

      const response = await apiRequest(
        `/articles/${article.slug}/favorite`,
        ArticleResponseSchema,
        {
          method: article.favorited ? 'DELETE' : 'POST',
        },
      );

      articles.value = articles.value.map(currentArticle =>
        currentArticle.slug === article.slug ? response.article : currentArticle,
      );
    } catch (error) {
      errorMessages.value = getErrorMessages(error);
    } finally {
      pendingFavoriteSlug.value = null;
    }
  }

  return {
    articles,
    articlesCount,
    offset,
    page,
    totalPages,
    isLoading,
    errorMessages,
    pendingFavoriteSlug,
    canGoPrevious,
    canGoNext,
    fetchArticles,
    goPrevious,
    goNext,
    toggleFavorite,
  };
}
