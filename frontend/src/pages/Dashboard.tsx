import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Paper,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Avatar,
  Badge,
  Fade,
  Grow,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  AssignmentTurnedIn as AssignmentIcon,
  Logout as LogoutIcon,
  SmartToy as AIIcon,
  FilterList as FilterIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircleOutline as DoneIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

interface Task {
  id: number;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'pending' | 'completed';
  category: {
    id: number;
    name: string;
    color: string;
  };
  notes: string | null;
  createdAt: string;
}

interface Category {
  id: number;
  name: string;
  color: string;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [rawNotes, setRawNotes] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [editDialog, setEditDialog] = useState<Task | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchTasks();
    fetchCategories();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks');
      setTasks(response.data.tasks);
    } catch (err) {
      setError('Failed to fetch tasks');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/tasks/categories');
      setCategories(response.data.categories);
    } catch (err) {
      setError('Failed to fetch categories');
    }
  };

  const handleParseNotes = async () => {
    if (!rawNotes.trim()) {
      setError('Please enter some notes to parse');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('/api/tasks/parse', { rawNotes });
      setSuccess(`✨ Successfully created ${response.data.tasks.length} task(s)!`);
      setRawNotes('');
      fetchTasks();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to parse notes');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (taskId: number, updates: Partial<Task>) => {
    try {
      await axios.patch(`/api/tasks/${taskId}`, updates);
      fetchTasks();
      setEditDialog(null);
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`/api/tasks/${taskId}`);
        fetchTasks();
      } catch (err) {
        setError('Failed to delete task');
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <DoneIcon sx={{ fontSize: 20 }} />;
      default: return <AssignmentIcon sx={{ fontSize: 20 }} />;
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (filterCategory !== 'all' && task.category.name !== filterCategory) return false;
    return true;
  });

  const tasksByStatus = {
    pending: filteredTasks.filter(t => t.status === 'pending'),
    completed: filteredTasks.filter(t => t.status === 'completed')
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Header with Gradient */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar sx={{ py: 2 }}>
          <AIIcon sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            AI Task Organizer
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.3)',
                fontWeight: 700,
              }}
            >
              {getInitials(user?.name || 'U')}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {user?.name}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {user?.email}
              </Typography>
            </Box>
            <Button
              color="inherit"
              onClick={logout}
              startIcon={<LogoutIcon />}
              sx={{
                ml: 2,
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                borderRadius: 2,
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
            <Grow in timeout={500}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: 4,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Total Tasks
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800 }}>
                      {tasks.length}
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                </Box>
              </Paper>
            </Grow>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Grow in timeout={700}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  borderRadius: 4,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      Completed
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800 }}>
                      {tasksByStatus.completed.length}
                    </Typography>
                  </Box>
                  <CheckCircleIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                </Box>
              </Paper>
            </Grow>
          </Grid>
        </Grid>

        {/* AI Input Section */}
        <Fade in timeout={1000}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 4,
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
              border: '1px solid',
              borderColor: 'rgba(102, 126, 234, 0.1)',
              borderRadius: 4,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AIIcon sx={{ mr: 2, color: '#667eea', fontSize: 32 }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  AI-Powered Task Parser
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Paste your scattered notes and let AI organize them into structured tasks
                </Typography>
              </Box>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                {success}
              </Alert>
            )}

            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Example: Finish PPT by Friday, check AWS logs for errors, call client about project update, review Q4 reports"
              value={rawNotes}
              onChange={(e) => setRawNotes(e.target.value)}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  fontSize: '1rem',
                },
              }}
            />
            <Button
              variant="contained"
              size="large"
              onClick={handleParseNotes}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AIIcon />}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              {loading ? 'AI is processing...' : 'Parse & Organize with AI'}
            </Button>
          </Paper>
        </Fade>

        {/* Filters */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Filters
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  label="Priority"
                >
                  <MenuItem value="all">All Priorities</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map(cat => (
                    <MenuItem key={cat.id} value={cat.name}>{cat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Tasks Tabs */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={(e, v) => setTabValue(v)}
              sx={{
                px: 2,
                '& .MuiTab-root': {
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  minHeight: 64,
                },
              }}
            >
              <Tab
                label={
                  <Badge badgeContent={tasksByStatus.pending.length} color="primary">
                    <Box sx={{ mr: 2 }}>Pending</Box>
                  </Badge>
                }
              />
              <Tab
                label={
                  <Badge badgeContent={tasksByStatus.completed.length} color="success">
                    <Box sx={{ mr: 2 }}>Completed</Box>
                  </Badge>
                }
              />
            </Tabs>
          </Box>

          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {(tabValue === 0 ? tasksByStatus.pending : tasksByStatus.completed).map(task => (
                <Grid item xs={12} sm={6} md={4} key={task.id}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(102, 126, 234, 0.15)',
                      },
                    }}
                  >
                    <CardContent sx={{ pb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Chip
                          label={task.priority}
                          size="small"
                          color={getPriorityColor(task.priority) as any}
                          sx={{ fontWeight: 700 }}
                        />
                        <Chip
                          label={task.category.name}
                          size="small"
                          sx={{
                            bgcolor: task.category.color,
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{
                          textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                          fontWeight: 600,
                          lineHeight: 1.3,
                          minHeight: 60,
                        }}
                      >
                        {task.title}
                      </Typography>
                      {task.notes && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mt: 1,
                          }}
                        >
                          {task.notes}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2, gap: 1 }}>
                      {task.status === 'pending' && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleUpdateTask(task.id, { status: 'completed' })}
                          sx={{ borderRadius: 2 }}
                        >
                          Complete
                        </Button>
                      )}
                      <Box sx={{ flexGrow: 1 }} />
                      <IconButton
                        size="small"
                        onClick={() => setEditDialog(task)}
                        sx={{ borderRadius: 2 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteTask(task.id)}
                        sx={{ borderRadius: 2 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {filteredTasks.length === 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  textAlign: 'center',
                  bgcolor: 'background.default',
                  borderRadius: 4,
                }}
              >
                <AIIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No tasks found
                </Typography>
                <Typography color="text.secondary">
                  Start by adding some task notes above and let AI organize them!
                </Typography>
              </Paper>
            )}
          </Box>
        </Paper>
      </Container>

      {/* Edit Dialog */}
      {editDialog && (
        <Dialog
          open={!!editDialog}
          onClose={() => setEditDialog(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 4 },
          }}
        >
          <DialogTitle sx={{ pb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Edit Task
            </Typography>
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Title"
              value={editDialog.title}
              onChange={(e) => setEditDialog({ ...editDialog, title: e.target.value })}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Priority</InputLabel>
              <Select
                value={editDialog.priority}
                onChange={(e) => setEditDialog({ ...editDialog, priority: e.target.value as any })}
                label="Priority"
              >
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={editDialog.status}
                onChange={(e) => setEditDialog({ ...editDialog, status: e.target.value as any })}
                label="Status"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={editDialog.notes || ''}
              onChange={(e) => setEditDialog({ ...editDialog, notes: e.target.value })}
              margin="normal"
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setEditDialog(null)} sx={{ borderRadius: 2 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => handleUpdateTask(editDialog.id, {
                title: editDialog.title,
                priority: editDialog.priority,
                status: editDialog.status,
                notes: editDialog.notes
              })}
              sx={{ borderRadius: 2, px: 3 }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default Dashboard;
