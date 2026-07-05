import { ref, watch, type Ref } from 'vue';
import * as z from 'zod';
import { apiRequest, getErrorMessages } from '@/lib/api';
import {
  CommentResponseSchema,
  CommentsResponseSchema,
  CreateCommentPayloadSchema,
  type Comment,
  type CreateCommentPayload,
} from '@/types/api';

/** Manages comment loading, creation, and deletion for an article. */
export function useComments(slug: Ref<string>) {
  const comments = ref<Comment[]>([]);
  const isLoading = ref(false);
  const isSaving = ref(false);
  const pendingDeleteId = ref<number | null>(null);
  const errorMessages = ref<string[]>([]);
  let requestId = 0;

  watch(
    slug,
    () => {
      void fetchComments();
    },
    { immediate: true },
  );

  /** Fetches comments for the current article slug. */
  async function fetchComments() {
    const currentRequestId = ++requestId;

    try {
      isLoading.value = true;
      errorMessages.value = [];
      const response = await apiRequest(
        `/articles/${slug.value}/comments`,
        CommentsResponseSchema,
      );

      if (currentRequestId === requestId) {
        comments.value = response.comments;
      }
    } catch (error) {
      if (currentRequestId === requestId) {
        comments.value = [];
        errorMessages.value = getErrorMessages(error);
      }
    } finally {
      if (currentRequestId === requestId) {
        isLoading.value = false;
      }
    }
  }

  /** Creates a new comment and prepends it to the local comment list. */
  async function createComment(payload: CreateCommentPayload) {
    try {
      isSaving.value = true;
      errorMessages.value = [];

      const response = await apiRequest(
        `/articles/${slug.value}/comments`,
        CommentResponseSchema,
        {
          method: 'POST',
          body: { comment: CreateCommentPayloadSchema.parse(payload) },
        },
      );

      comments.value = [response.comment, ...comments.value];
    } catch (error) {
      errorMessages.value = getErrorMessages(error);
      throw error;
    } finally {
      isSaving.value = false;
    }
  }

  /** Deletes a comment and removes it from the local comment list. */
  async function deleteComment(commentId: number) {
    try {
      pendingDeleteId.value = commentId;
      errorMessages.value = [];

      await apiRequest(
        `/articles/${slug.value}/comments/${commentId}`,
        z.undefined(),
        {
          method: 'DELETE',
        },
      );

      comments.value = comments.value.filter(comment => comment.id !== commentId);
    } catch (error) {
      errorMessages.value = getErrorMessages(error);
    } finally {
      pendingDeleteId.value = null;
    }
  }

  return {
    comments,
    isLoading,
    isSaving,
    pendingDeleteId,
    errorMessages,
    fetchComments,
    createComment,
    deleteComment,
  };
}
