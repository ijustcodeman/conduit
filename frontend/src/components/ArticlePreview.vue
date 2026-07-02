<script setup lang="ts">
import type { Article } from '@/types/api';

defineProps<{
  article: Article;
  isFavoritePending: boolean;
}>();

const emit = defineEmits<{
  favorite: [article: Article];
}>();

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}
</script>

<template>
  <article class="article-preview">
    <header class="article-preview-header">
      <div>
        <RouterLink
          class="author-link"
          :to="{ name: 'profile', params: { username: article.author.username } }"
        >
          {{ article.author.username }}
        </RouterLink>
        <p>
          <time :datetime="article.createdAt">{{ formatDate(article.createdAt) }}</time>
        </p>
      </div>

      <button
        class="favorite-button"
        :class="{ active: article.favorited }"
        :disabled="isFavoritePending"
        type="button"
        :aria-label="`${article.favorited ? 'Unfavorite' : 'Favorite'} ${article.title}`"
        @click="emit('favorite', article)"
      >
        <span aria-hidden="true">♥</span>
        {{ article.favoritesCount }}
      </button>
    </header>

    <RouterLink
      class="article-title-link"
      :to="{ name: 'article', params: { slug: article.slug } }"
    >
      <h2>{{ article.title }}</h2>
    </RouterLink>
    <p class="article-description">{{ article.description }}</p>

    <footer class="article-preview-footer">
      <RouterLink :to="{ name: 'article', params: { slug: article.slug } }">
        Read more...
      </RouterLink>
      <ul v-if="article.tagList.length" class="tag-list" aria-label="Article tags">
        <li v-for="tag in article.tagList" :key="tag">
          {{ tag }}
        </li>
      </ul>
    </footer>
  </article>
</template>
