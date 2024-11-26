'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Send as SendIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export default function CommentsPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [projectId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
          // In a real app, these would come from the authenticated user
          authorId: 'current-user-id',
          authorName: 'Current User',
        }),
      });

      if (!response.ok) throw new Error('Failed to post comment');

      await fetchComments();
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleEdit = async () => {
    if (!editingComment || !editingComment.content.trim()) return;

    try {
      const response = await fetch(
        `/api/projects/${projectId}/comments/${editingComment.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: editingComment.content,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to update comment');

      await fetchComments();
      handleCloseEditDialog();
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(
        `/api/projects/${projectId}/comments/${commentId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) throw new Error('Failed to delete comment');

      await fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      handleCloseMenu();
    }
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, comment: Comment) => {
    setAnchorEl(event.currentTarget);
    setSelectedComment(comment);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedComment(null);
  };

  const handleOpenEditDialog = () => {
    setEditingComment(selectedComment);
    setOpenEditDialog(true);
    handleCloseMenu();
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditingComment(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Comments
      </Typography>

      {/* Comment List */}
      <List sx={{ mb: 4 }}>
        {comments.map((comment) => (
          <ListItem
            key={comment.id}
            alignItems="flex-start"
            component={Paper}
            sx={{ mb: 2, p: 2 }}
          >
            <ListItemAvatar>
              <Avatar>{comment.authorName[0]}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography component="span" variant="subtitle1" color="text.primary">
                      {comment.authorName}
                    </Typography>
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                      {formatDate(comment.createdAt)}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => handleOpenMenu(e, comment)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              }
              secondary={
                <Typography
                  component="span"
                  variant="body1"
                  color="text.primary"
                  sx={{ display: 'block', mt: 1 }}
                >
                  {comment.content}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>

      {/* New Comment Input */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Button
          variant="contained"
          endIcon={<SendIcon />}
          onClick={handleSubmit}
          disabled={!newComment.trim()}
        >
          Post
        </Button>
      </Box>

      {/* Comment Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleOpenEditDialog}>
          <EditIcon sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem
          onClick={() => selectedComment && handleDelete(selectedComment.id)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Comment</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={editingComment?.content || ''}
            onChange={(e) =>
              setEditingComment(
                editingComment
                  ? { ...editingComment, content: e.target.value }
                  : null
              )
            }
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={handleEdit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
