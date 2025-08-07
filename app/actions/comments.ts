'use server';

import { prisma } from '@/prisma/prisma-client';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { revalidateTag } from 'next/cache';
import { authOptions } from '@/lib/auth';

const createCommentSchema = z.object({
  shoeId: z.number().int().positive(),
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment is too long'),
});

const updateCommentSchema = z.object({
  commentId: z.number().int().positive(),
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment is too long'),
});

const deleteCommentSchema = z.object({
  commentId: z.number().int().positive(),
});

export async function createComment(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error('Session details:', {
        sessionExists: !!session,
        userExists: !!session?.user,
        userId: session?.user?.id,
      });
      return { success: false, error: 'Unauthorized' };
    }

    const data = createCommentSchema.parse({
      shoeId: Number(formData.get('shoeId')),
      content: formData.get('content'),
    });

    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        userId: Number(session.user.id),
        shoeId: data.shoeId,
      },
      include: {
        user: { select: { fullName: true, avatar: true, username: true } },
      },
    });

    console.log('Comment created:', {
      commentId: comment.id,
      shoeId: data.shoeId,
      userId: session.user.id,
      content: data.content,
    });

    revalidateTag(`shoe-${data.shoeId}`);

    return {
      success: true,
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        userId: comment.userId,
        shoeId: comment.shoeId,
        user: {
          fullName:
            comment.user.fullName || comment.user.username || 'Anonymous',
          avatar: comment.user.avatar || null,
          username: comment.user.username || null,
        },
      },
    };
  } catch (error) {
    console.error('Create comment error:', error);
    return { success: false, error: 'Failed to create comment' };
  }
}

export async function updateComment(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const data = updateCommentSchema.parse({
      commentId: Number(formData.get('commentId')),
      content: formData.get('content'),
    });

    const comment = await prisma.comment.findUnique({
      where: { id: data.commentId },
      include: { user: { select: { id: true } } },
    });

    if (!comment) {
      return { success: false, error: 'Comment not found' };
    }

    if (comment.userId !== Number(session.user.id)) {
      return { success: false, error: 'Unauthorized to update this comment' };
    }

    const updatedComment = await prisma.comment.update({
      where: { id: data.commentId },
      data: { content: data.content },
      include: {
        user: { select: { fullName: true, avatar: true, username: true } },
      },
    });

    console.log('Comment updated:', {
      commentId: updatedComment.id,
      userId: session.user.id,
      content: data.content,
    });

    revalidateTag(`shoe-${updatedComment.shoeId}`);

    return {
      success: true,
      comment: {
        id: updatedComment.id,
        content: updatedComment.content,
        createdAt: updatedComment.createdAt.toISOString(),
        updatedAt: updatedComment.updatedAt.toISOString(),
        userId: updatedComment.userId,
        shoeId: updatedComment.shoeId,
        user: {
          fullName:
            updatedComment.user.fullName ||
            updatedComment.user.username ||
            'Anonymous',
          avatar: updatedComment.user.avatar || null,
          username: updatedComment.user.username || null,
        },
      },
    };
  } catch (error) {
    console.error('Update comment error:', error);
    return { success: false, error: 'Failed to update comment' };
  }
}

export async function deleteComment(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const data = deleteCommentSchema.parse({
      commentId: Number(formData.get('commentId')),
    });

    const comment = await prisma.comment.findUnique({
      where: { id: data.commentId },
      include: { user: { select: { id: true } } },
    });

    if (!comment) {
      return { success: false, error: 'Comment not found' };
    }

    if (comment.userId !== Number(session.user.id)) {
      return { success: false, error: 'Unauthorized to delete this comment' };
    }

    await prisma.comment.delete({
      where: { id: data.commentId },
    });

    console.log('Comment deleted:', {
      commentId: data.commentId,
      userId: session.user.id,
    });

    revalidateTag(`shoe-${comment.shoeId}`);

    return { success: true };
  } catch (error) {
    console.error('Delete comment error:', error);
    return { success: false, error: 'Failed to delete comment' };
  }
}

export async function getComments(shoeId: number) {
  try {
    const comments = await prisma.comment.findMany({
      where: { shoeId },
      include: {
        user: { select: { fullName: true, avatar: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return {
      success: true,
      comments: comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        userId: comment.userId,
        shoeId: comment.shoeId,
        user: {
          fullName:
            comment.user.fullName || comment.user.username || 'Anonymous',
          avatar: comment.user.avatar || null,
          username: comment.user.username || null,
        },
      })),
    };
  } catch (error) {
    console.error('Get comments error:', error);
    return { success: false, error: 'Failed to fetch comments' };
  }
}
