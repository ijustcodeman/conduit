<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import ArticlePreview from '@/components/ArticlePreview.vue';
import { useArticles } from '@/composables/useArticles';
import { useAuth } from '@/composables/useAuth';
import { useProfile } from '@/composables/useProfile';

const route = useRoute();
const auth = useAuth();

const username = computed(() => String(route.params.username));
const selectedTag = ref<string | null>(null);
const activeFeed = ref<'global'>('global');
const activeProfileTab = ref<'stories' | 'liked'>('stories');
const authorFilter = computed(() =>
  activeProfileTab.value === 'stories' ? username.value : null,
);
const favoritedFilter = computed(() =>
  activeProfileTab.value === 'liked' ? username.value : null,
);
const profileState = useProfile(username);
const articles = useArticles({
  feedMode: activeFeed,
  selectedTag,
  author: authorFilter,
  favorited: favoritedFilter,
});

const isOwnProfile = computed(
  () => auth.user.value?.username === profileState.profile.value?.username,
);
const defaultProfileImage = '/default-avatar.svg';

/** Resets profile article filters when navigating to another profile. */
watch(username, () => {
  selectedTag.value = null;
  activeProfileTab.value = 'stories';
});
</script>

<template>
  <section v-if="profileState.isLoading.value" class="content-panel">
    <p>Loading profile...</p>
  </section>

  <section v-else-if="profileState.errorMessages.value.length" class="content-panel">
    <ul class="error-list" role="alert">
      <li v-for="message in profileState.errorMessages.value" :key="message">
        {{ message }}
      </li>
    </ul>
  </section>

  <template v-else-if="profileState.profile.value">
    <section class="profile-header" aria-labelledby="profile-title">
      <img
        :src="profileState.profile.value.image || defaultProfileImage"
        :alt="`${profileState.profile.value.username}'s profile image`"
      >

      <div>
        <p>Profile</p>
        <h1 id="profile-title">{{ profileState.profile.value.username }}</h1>
        <p v-if="profileState.profile.value.bio" class="profile-bio">
          {{ profileState.profile.value.bio }}
        </p>
      </div>

      <button
        v-if="!isOwnProfile"
        class="profile-follow-button"
        :class="{ active: profileState.profile.value.following }"
        :disabled="profileState.isFollowPending.value"
        type="button"
        @click="profileState.toggleFollow"
      >
        {{
          profileState.profile.value.following
            ? 'Unfollow'
            : `Follow ${profileState.profile.value.username}`
        }}
      </button>
    </section>

    <section class="profile-articles" aria-labelledby="profile-articles-title">
      <header class="section-heading">
        <h2 id="profile-articles-title">
          {{
            activeProfileTab === 'stories'
              ? `Stories by ${profileState.profile.value.username}`
              : `Liked by ${profileState.profile.value.username}`
          }}
        </h2>
      </header>

      <div class="tab-list profile-tabs" role="tablist" aria-label="Profile article filters">
        <button
          :class="{ active: activeProfileTab === 'stories' }"
          type="button"
          role="tab"
          :aria-selected="activeProfileTab === 'stories'"
          @click="activeProfileTab = 'stories'"
        >
          Stories
        </button>
        <button
          :class="{ active: activeProfileTab === 'liked' }"
          type="button"
          role="tab"
          :aria-selected="activeProfileTab === 'liked'"
          @click="activeProfileTab = 'liked'"
        >
          Liked
        </button>
      </div>

      <ul v-if="articles.errorMessages.value.length" class="error-list" role="alert">
        <li v-for="message in articles.errorMessages.value" :key="message">
          {{ message }}
        </li>
      </ul>

      <p v-if="articles.isLoading.value" class="list-status">Loading stories...</p>

      <article
        v-else-if="!articles.articles.value.length"
        class="empty-state"
        aria-labelledby="profile-empty-title"
      >
        <h3 id="profile-empty-title">No stories yet</h3>
        <p>
          {{
            activeProfileTab === 'stories'
              ? 'This author has not published anything yet.'
              : 'This author has not liked any stories yet.'
          }}
        </p>
      </article>

      <ol v-else class="article-list" aria-label="Profile articles">
        <li v-for="article in articles.articles.value" :key="article.slug">
          <ArticlePreview
            :article="article"
            :is-favorite-pending="articles.pendingFavoriteSlug.value === article.slug"
            @favorite="articles.toggleFavorite"
          />
        </li>
      </ol>

      <nav
        v-if="articles.articlesCount.value > 0"
        class="pagination"
        aria-label="Profile article pagination"
      >
        <button
          type="button"
          :disabled="!articles.canGoPrevious.value || articles.isLoading.value"
          @click="articles.goPrevious"
        >
          Previous
        </button>
        <p>
          Page {{ articles.page.value }} of {{ articles.totalPages.value }}
        </p>
        <button
          type="button"
          :disabled="!articles.canGoNext.value || articles.isLoading.value"
          @click="articles.goNext"
        >
          Next
        </button>
      </nav>
    </section>
  </template>
</template>
