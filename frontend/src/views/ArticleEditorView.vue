<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useArticleEditor } from '@/composables/useArticleEditor';

const route = useRoute();
const router = useRouter();

const slug = computed(() =>
  typeof route.params.slug === 'string' ? route.params.slug : null,
);
const editor = useArticleEditor(slug);

const pageTitle = computed(() =>
  editor.isEditing.value ? 'Edit story' : 'Write a story',
);
const submitLabel = computed(() =>
  editor.isEditing.value ? 'Save changes' : 'Publish',
);

async function submitArticle() {
  try {
    const article = await editor.saveArticle();
    await router.push({ name: 'article', params: { slug: article.slug } });
  } catch {
    // User-facing errors are exposed by the editor composable.
  }
}
</script>

<template>
  <section class="editor-page" aria-labelledby="editor-title">
    <header class="page-heading">
      <h1 id="editor-title">{{ pageTitle }}</h1>
    </header>

    <p v-if="editor.isLoading.value" class="list-status">Loading story...</p>

    <ul v-if="editor.errorMessages.value.length" class="error-list" role="alert">
      <li v-for="message in editor.errorMessages.value" :key="message">
        {{ message }}
      </li>
    </ul>

    <form v-if="!editor.isLoading.value" class="editor-form" @submit.prevent="submitArticle">
      <label>
        Title
        <input
          v-model="editor.form.title"
          autocomplete="off"
          name="title"
          required
          type="text"
        >
      </label>

      <label>
        Description
        <input
          v-model="editor.form.description"
          autocomplete="off"
          name="description"
          required
          type="text"
        >
      </label>

      <label>
        Body
        <textarea
          v-model="editor.form.body"
          name="body"
          required
          rows="14"
        />
      </label>

      <label v-if="!editor.isEditing.value">
        Tags
        <input
          v-model="editor.form.tags"
          autocomplete="off"
          name="tags"
          type="text"
        >
      </label>

      <div class="editor-actions">
        <RouterLink
          v-if="editor.article.value"
          :to="{ name: 'article', params: { slug: editor.article.value.slug } }"
        >
          Cancel
        </RouterLink>
        <RouterLink v-else to="/">Cancel</RouterLink>
        <button class="primary-action" :disabled="editor.isSaving.value" type="submit">
          {{ editor.isSaving.value ? 'Saving...' : submitLabel }}
        </button>
      </div>
    </form>
  </section>
</template>
