<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useArticleEditor } from '@/composables/useArticleEditor';

const route = useRoute();
const router = useRouter();

const slug = computed(() =>
  typeof route.params.slug === 'string' ? route.params.slug : null,
);
const editor = useArticleEditor(slug);
const tagInput = ref('');

const pageTitle = computed(() =>
  editor.isEditing.value ? 'Edit story' : 'Write a story',
);
const submitLabel = computed(() =>
  editor.isEditing.value ? 'Save changes' : 'Publish',
);
const tags = computed(() => parseTags(editor.form.tags));

/** Saves the article and navigates to its detail page. */
async function submitArticle() {
  addTag();

  try {
    const article = await editor.saveArticle();
    await router.push({ name: 'article', params: { slug: article.slug } });
  } catch {
    // User-facing errors are exposed by the editor composable.
  }
}

/** Converts tag separator keys into tag chips. */
function handleTagKeydown(event: KeyboardEvent) {
  if (event.key !== ' ' && event.key !== ',' && event.key !== 'Enter') {
    return;
  }

  event.preventDefault();
  addTag();
}

/** Adds the current tag input to the editor form. */
function addTag() {
  const nextTag = tagInput.value.trim().replace(/^#/, '');

  if (!nextTag) {
    tagInput.value = '';
    return;
  }

  const nextTags = [...tags.value, nextTag];
  editor.form.tags = Array.from(new Set(nextTags)).join(', ');
  tagInput.value = '';
}

/** Removes a tag from the editor form. */
function removeTag(tag: string) {
  editor.form.tags = tags.value
    .filter(currentTag => currentTag !== tag)
    .join(', ');
}

/** Converts a comma-separated tag string into trimmed tag names. */
function parseTags(value: string) {
  return value
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean);
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

      <div v-if="!editor.isEditing.value" class="tag-editor">
        <label for="article-tags">Tags</label>
        <div class="tag-editor-box">
          <ul v-if="tags.length" class="tag-editor-list" aria-label="Selected tags">
            <li v-for="tag in tags" :key="tag">
              <span>{{ tag }}</span>
              <button
                type="button"
                :aria-label="`Remove ${tag} tag`"
                @click="removeTag(tag)"
              >
                ×
              </button>
            </li>
          </ul>
          <input
            id="article-tags"
            v-model="tagInput"
            autocomplete="off"
            name="tag-input"
            type="text"
            @blur="addTag"
            @keydown="handleTagKeydown"
          >
        </div>
      </div>

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
