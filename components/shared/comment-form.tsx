'use client';

import { useState, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  createComment,
  updateComment,
  deleteComment,
} from '@/app/actions/comments';
import { message } from 'antd';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ShoeComment } from '@/components/shared/types'; // Updated import
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Smile, Trash2 } from 'lucide-react';

interface CommentFormProps {
  shoeId: number;
  onCommentAdded: (newComment: ShoeComment, isOptimistic?: boolean) => void; // Updated type
  onCommentUpdated?: (updatedComment: ShoeComment) => void; // Updated type
  onCommentDeleted?: (commentId: number) => void;
  initialComment?: ShoeComment; // Updated type
}

export function CommentForm({
  shoeId,
  onCommentAdded,
  onCommentUpdated,
  onCommentDeleted,
  initialComment,
}: CommentFormProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState(initialComment?.content || '');
  const [messageApi, contextHolder] = message.useMessage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isEditing, setIsEditing] = useState(!!initialComment);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      messageApi.error('Please sign in to leave a comment');
      return;
    }

    setIsSubmitting(true);

    if (isEditing && initialComment) {
      // Update existing comment
      const formData = new FormData();
      formData.append('commentId', initialComment.id.toString());
      formData.append('content', content);

      const result = await updateComment(formData);
      if (result.success && result.comment) {
        messageApi.success('Comment updated successfully');
        setContent('');
        setIsEditing(false);
        onCommentUpdated?.({
          ...result.comment,
          createdAt: new Date(result.comment.createdAt),
          updatedAt: new Date(result.comment.updatedAt),
        });
      } else {
        messageApi.error(result.error || 'Failed to update comment');
      }
    } else {
      // Create new comment
      const tempId = -Date.now();
      const optimisticComment: ShoeComment = {
        id: tempId,
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: Number(session.user.id) || -1,
        shoeId,
        user: {
          fullName: session.user.name || session.user.username || 'Anonymous',
          avatar: session.user.image || null,
          username: session.user.username || null,
        },
      };

      onCommentAdded(optimisticComment, true);

      const formData = new FormData();
      formData.append('shoeId', shoeId.toString());
      formData.append('content', content);

      try {
        const result = await createComment(formData);
        if (result.success && result.comment) {
          messageApi.success('Comment added successfully');
          setContent('');
          onCommentAdded({
            ...result.comment,
            createdAt: new Date(result.comment.createdAt),
            updatedAt: new Date(result.comment.updatedAt),
          });
        } else {
          messageApi.error(result.error || 'Failed to add comment');
          onCommentAdded({ ...optimisticComment, id: tempId }, false);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (error.name === 'ZodError') {
          const zodError = error.errors.find(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (e: any) => e.path.includes('content') && e.code === 'too_big'
          );
          if (zodError) {
            messageApi.error('Comment is too long (maximum 500 characters)');
          } else {
            messageApi.error('Invalid comment input');
          }
          onCommentAdded({ ...optimisticComment, id: tempId }, false);
        } else {
          messageApi.error('Failed to add comment');
          onCommentAdded({ ...optimisticComment, id: tempId }, false);
        }
      }
    }
    setIsSubmitting(false);
    setShowEmojiPicker(false);
  };

  const handleDelete = async () => {
    if (!initialComment) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('commentId', initialComment.id.toString());

    const result = await deleteComment(formData);
    if (result.success) {
      messageApi.success('Comment deleted successfully');
      setContent('');
      setIsEditing(false);
      onCommentDeleted?.(initialComment.id);
    } else {
      messageApi.error(result.error || 'Failed to delete comment');
    }
    setIsSubmitting(false);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const startPos = textarea.selectionStart || 0;
      const endPos = textarea.selectionEnd || 0;
      const newContent =
        content.substring(0, startPos) +
        emojiData.emoji +
        content.substring(endPos);
      setContent(newContent);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd =
          startPos + emojiData.emoji.length;
        textarea.focus();
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  return (
    <div className="mt-6">
      {contextHolder}
      {!session ? (
        <p className="text-muted-foreground">
          Please{' '}
          <Link href="/login" className="text-primary underline">
            sign in
          </Link>{' '}
          to leave a comment.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                isEditing ? 'Edit your comment...' : 'Write your comment...'
              }
              rows={4}
              className="w-full break-words pr-12"
            />
            <Button
              ref={buttonRef}
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              disabled={isSubmitting}
            >
              <Smile className="h-5 w-5" />
            </Button>
          </div>
          {showEmojiPicker && (
            // НЕ МЕНЯТЬ СТИЛИ
            <div className="absolute z-10 mt-15 right-0 sm:mt-[-450] sm:right-30">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting || !content.trim()}>
              {isSubmitting
                ? isEditing
                  ? 'Updating...'
                  : 'Submitting...'
                : isEditing
                  ? 'Update Comment'
                  : 'Post Comment'}
            </Button>
            {isEditing && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="text-destructive hover:text-destructive/80"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
