'use client';

import { useState } from 'react';
import { Image } from 'antd';
import { capitalizeWords } from '@/lib/utils';
import Link from 'next/link';
import AddToCartButton from '@/components/shared/add-to-cart-button';
import { FavoriteButton } from '@/components/shared/favorite-button';
import { CommentForm } from '@/components/shared/comment-form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ShoeCardType, ShoeComment } from '@/components/shared/types';
import { useSession } from 'next-auth/react';
import { Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteComment } from '@/app/actions/comments';
import { message } from 'antd';

interface Props {
  shoe: ShoeCardType & { comments: ShoeComment[] };
  isFavorited: boolean;
  likeCount: number;
  userId: number | null;
}

export default function ShoePageClient({
  shoe,
  isFavorited,
  likeCount,
  userId,
}: Props) {
  const [comments, setComments] = useState<ShoeComment[]>(shoe.comments);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const { data: session } = useSession();
  const [messageApi, contextHolder] = message.useMessage();

  const handleCommentAdded = (
    newComment: ShoeComment,
    isOptimistic: boolean = false
  ) => {
    setComments((prevComments) => {
      if (isOptimistic && newComment.id < 0) {
        const existingIndex = prevComments.findIndex(
          (c) => c.id === newComment.id
        );
        if (existingIndex !== -1) {
          const updatedComments = [...prevComments];
          updatedComments[existingIndex] = newComment;
          return updatedComments;
        }
        return [newComment, ...prevComments];
      } else if (!isOptimistic && newComment.id < 0) {
        return prevComments.filter((c) => c.id !== newComment.id);
      } else {
        const optimisticIndex = prevComments.findIndex((c) => c.id < 0);
        if (optimisticIndex !== -1) {
          const updatedComments = [...prevComments];
          updatedComments[optimisticIndex] = newComment;
          return updatedComments;
        }
        return [newComment, ...prevComments];
      }
    });
  };

  const handleCommentDeleted = async (commentId: number) => {
    if (!session?.user?.id) {
      messageApi.error('Please sign in to delete a comment');
      return;
    }

    const formData = new FormData();
    formData.append('commentId', commentId.toString());

    const result = await deleteComment(formData);
    if (result.success) {
      messageApi.success('Comment deleted successfully');
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== commentId)
      );
      setEditingCommentId(null);
    } else {
      messageApi.error(result.error || 'Failed to delete comment');
    }
  };

  const handleCommentUpdated = (updatedComment: ShoeComment) => {
    setComments((prevComments) => {
      const index = prevComments.findIndex((c) => c.id === updatedComment.id);
      if (index !== -1) {
        const updatedComments = [...prevComments];
        updatedComments[index] = updatedComment;
        return updatedComments;
      }
      return prevComments;
    });
    setEditingCommentId(null);
  };

  const handleEditClick = (commentId: number) => {
    setEditingCommentId(commentId);
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-5 sm:px-6 sm:py-8">
      {contextHolder}
      <div className="flex flex-col gap-6 sm:gap-8">
        <div className="breadcrumbs text-sm">
          <ul className="flex flex-wrap">
            <li>
              <Link href="/" prefetch>
                All Shoes
              </Link>
            </li>
            <li className="font-semibold">
              {capitalizeWords(`${shoe.model.brand.name} ${shoe.model.name}`)}
            </li>
          </ul>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10 items-center">
          <div className="flex justify-center">
            <div className="w-full max-w-[300px] sm:max-w-[450px]">
              <Image
                src={shoe.imageURL}
                alt={shoe.model.name}
                width="100%"
                className="object-contain rounded-lg shadow-md"
              />
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-4">
            <h1 className="text-2xl sm:text-3xl font-bold capitalize tracking-tight">
              {shoe.model.brand.name} {shoe.model.name}
            </h1>
            <p className="text-primary/50 text-base sm:text-lg">
              {shoe.description}
            </p>

            <div className="flex flex-wrap gap-3 sm:gap-4 mt-4 text-sm">
              <span className="bg-secondary px-3 py-1 rounded-full text-primary">
                Gender: {shoe.gender}
              </span>
              <span className="bg-secondary px-3 py-1 rounded-full text-primary">
                Brand:{' '}
                <span className="uppercase">{shoe.model.brand.name}</span>
              </span>
            </div>

            <p className="text-xl sm:text-2xl font-semibold text-primary mt-4 sm:mt-6">
              ${shoe.price}.<span className="text-sm">00</span>
            </p>

            <div className="flex items-center gap-4">
              <AddToCartButton shoeId={shoe.id} />
            </div>

            <div className="px-1 rounded-2xl bg-secondary w-fit">
              <FavoriteButton
                details
                shoeId={shoe.id}
                isFavorited={isFavorited}
                likeCount={likeCount}
                userId={userId}
              />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Comments</h2>
          {comments.length === 0 ? (
            <p className="text-muted-foreground">
              No comments yet. Be the first to leave one!
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="border p-4 rounded-lg bg-muted/50 break-words"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={comment.user.avatar || undefined}
                        alt={comment.user.fullName}
                      />
                      <AvatarFallback>
                        {comment.user.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{comment.user.fullName}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {session?.user?.id &&
                          session.user.id === comment.userId && (
                            <div className="flex flex-col sm:flex-row">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditClick(comment.id)}
                                className="text-primary hover:text-primary/80"
                              >
                                <Pencil className="h-5 w-5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCommentDeleted(comment.id)}
                                className="text-destructive hover:text-destructive/80"
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                  {editingCommentId === comment.id ? (
                    <CommentForm
                      shoeId={shoe.id}
                      onCommentAdded={handleCommentAdded}
                      onCommentUpdated={handleCommentUpdated}
                      onCommentDeleted={handleCommentDeleted}
                      initialComment={comment}
                    />
                  ) : (
                    <p className="text-base">{comment.content}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          {editingCommentId === null && (
            <CommentForm
              shoeId={shoe.id}
              onCommentAdded={handleCommentAdded}
              onCommentUpdated={handleCommentUpdated}
            />
          )}
        </div>
      </div>
    </main>
  );
}
