<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { useArticle } from '@/composables/useArticle';
import { useAuth } from '@/composables/useAuth';
import { useComments } from '@/composables/useComments';

const route = useRoute();
const auth = useAuth();

const slug = computed(() => String(route.params.slug));
const articleState = useArticle(slug);
const commentState = useComments(slug);

const commentForm = reactive({
  body: '',
});

const isAuthor = computed(
  () =>
    auth.user.value?.username === articleState.article.value?.author.username,
);
const defaultProfileImage = '/default-avatar.svg';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

async function submitComment() {
  try {
    await commentState.createComment({
      body: commentForm.body,
    });
    commentForm.body = '';
  } catch {
    // User-facing errors are exposed by the comments composable.
  }
}

async function confirmDeleteArticle() {
  const shouldDelete = window.confirm(
    'Delete this story? This cannot be undone.',
  );

  if (shouldDelete) {
    await articleState.deleteArticle();
  }
}

async function confirmDeleteComment(commentId: number) {
  const shouldDelete = window.confirm(
    'Delete this comment? This cannot be undone.',
  );

  if (shouldDelete) {
    await commentState.deleteComment(commentId);
  }
}
</script>

<template>
  <section v-if="articleState.isLoading.value" class="content-panel">
    <p>Loading article...</p>
  </section>

  <section v-else-if="articleState.errorMessages.value.length" class="content-panel">
    <ul class="error-list" role="alert">
      <li v-for="message in articleState.errorMessages.value" :key="message">
        {{ message }}
      </li>
    </ul>
  </section>

  <article v-else-if="articleState.article.value" class="article-detail">
    <header class="article-hero">
      <p>Article</p>
      <h1>{{ articleState.article.value.title }}</h1>

      <div class="article-meta-row">
        <RouterLink
          class="author-summary"
          :to="{
            name: 'profile',
            params: { username: articleState.article.value.author.username },
          }"
        >
          <img
            :src="articleState.article.value.author.image || defaultProfileImage"
            :alt="`${articleState.article.value.author.username}'s profile image`"
          >
          <span>
            <strong>{{ articleState.article.value.author.username }}</strong>
            <time :datetime="articleState.article.value.createdAt">
              {{ formatDate(articleState.article.value.createdAt) }}
            </time>
          </span>
        </RouterLink>

        <button
          class="favorite-button"
          :class="{ active: articleState.article.value.favorited }"
          :disabled="articleState.isFavoritePending.value"
          type="button"
          @click="articleState.toggleFavorite"
        >
          <span aria-hidden="true">♥</span>
          {{ articleState.article.value.favorited ? 'Unfavorite' : 'Favorite' }}
          {{ articleState.article.value.favoritesCount }}
        </button>
      </div>

      <div v-if="isAuthor" class="article-owner-actions">
        <RouterLink
          :to="{
            name: 'article-edit',
            params: { slug: articleState.article.value.slug },
          }"
        >
          Edit story
        </RouterLink>
        <button
          type="button"
          :disabled="articleState.isDeleting.value"
          @click="confirmDeleteArticle"
        >
          {{ articleState.isDeleting.value ? 'Deleting...' : 'Delete story' }}
        </button>
      </div>
    </header>

    <section class="article-body" aria-label="Article content">
      <p>{{ articleState.article.value.body }}</p>
    </section>

    <footer
      v-if="articleState.article.value.tagList.length"
      class="article-detail-footer"
    >
      <ul class="tag-list" aria-label="Article tags">
        <li v-for="tag in articleState.article.value.tagList" :key="tag">
          {{ tag }}
        </li>
      </ul>
    </footer>

    <section class="comments-section" aria-labelledby="comments-title">
      <h2 id="comments-title">Comments</h2>

      <ul
        v-if="commentState.errorMessages.value.length"
        class="error-list"
        role="alert"
      >
        <li v-for="message in commentState.errorMessages.value" :key="message">
          {{ message }}
        </li>
      </ul>

      <form
        v-if="auth.isAuthenticated.value"
        class="comment-form"
        @submit.prevent="submitComment"
      >
        <label>
          Add a comment
          <textarea
            v-model="commentForm.body"
            name="comment"
            required
            rows="4"
          />
        </label>
        <button
          class="primary-action"
          :disabled="commentState.isSaving.value"
          type="submit"
        >
          {{ commentState.isSaving.value ? 'Posting...' : 'Post comment' }}
        </button>
      </form>

      <p v-else class="login-prompt">
        <RouterLink :to="{ name: 'login', query: { redirect: route.fullPath } }">
          Sign in
        </RouterLink>
        to comment on this article.
      </p>

      <p v-if="commentState.isLoading.value" class="list-status">
        Loading comments...
      </p>

      <ol
        v-else-if="commentState.comments.value.length"
        class="comment-list"
        aria-label="Article comments"
      >
        <li v-for="comment in commentState.comments.value" :key="comment.id">
          <article class="comment-card">
            <header>
              <RouterLink
                class="author-summary small"
                :to="{
                  name: 'profile',
                  params: { username: comment.author.username },
                }"
              >
                <img
                  :src="comment.author.image || defaultProfileImage"
                  :alt="`${comment.author.username}'s profile image`"
                >
                <span>
                  <strong>{{ comment.author.username }}</strong>
                  <time :datetime="comment.createdAt">
                    {{ formatDate(comment.createdAt) }}
                  </time>
                </span>
              </RouterLink>
              <button
                v-if="auth.user.value?.username === comment.author.username"
                type="button"
                :disabled="commentState.pendingDeleteId.value === comment.id"
                @click="confirmDeleteComment(comment.id)"
              >
                Delete
              </button>
            </header>
            <p>{{ comment.body }}</p>
          </article>
        </li>
      </ol>

      <p v-else class="list-status">No comments yet.</p>
    </section>
  </article>
</template>
