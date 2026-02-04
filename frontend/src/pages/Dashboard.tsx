import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Paper,
  TextField,
  Card,
  CardContent,
  CardActions,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stack,
} from "@mui/material";
import {
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

interface Task {
  id: number;
  title: string;
  priority: "High" | "Medium" | "Low";
  status: "pending" | "completed";
  category: {
    id: number;
    name: string;
    color: string;
  };
  notes: string | null;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [rawNotes, setRawNotes] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [editDialog, setEditDialog] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get("/api/tasks");
      setTasks(response.data.tasks);
    } catch (err) {
      setError("Failed to fetch tasks");
    }
  };

  const handleParseNotes = async () => {
    if (!rawNotes.trim()) {
      setError("Please enter some notes to parse");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("/api/tasks/parse", { rawNotes });
      setSuccess(
        `✨ Successfully created ${response.data.tasks.length} task(s)!`
      );
      setRawNotes("");
      fetchTasks();
      setTimeout(() => setSuccess(""), 5000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to parse notes");
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
      setError("Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await axios.delete(`/api/tasks/${taskId}`);
        fetchTasks();
      } catch (err) {
        setError("Failed to delete task");
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "error";
      case "Medium":
        return "warning";
      case "Low":
        return "info";
      default:
        return "default";
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filterStatus !== "all" && task.status !== filterStatus) return false;
    return true;
  });

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      {/* Simple Header */}
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AI Task Organizer
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.name}
          </Typography>
          <Button color="inherit" onClick={logout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* AI Input */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Add Tasks with AI
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Example: Finish report by Friday, call client, review code"
            value={rawNotes}
            onChange={(e) => setRawNotes(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleParseNotes}
            disabled={loading}
          >
            {loading ? "Processing..." : "Parse Tasks"}
          </Button>
        </Paper>

        {/* Filter */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
        </Paper>

        {/* Tasks List */}
        <Stack spacing={2}>
          {filteredTasks.map((task) => (
            <Card key={task.id} variant="outlined">
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      textDecoration:
                        task.status === "completed" ? "line-through" : "none",
                    }}
                  >
                    {task.title}
                  </Typography>
                  <Box>
                    <Chip
                      label={task.priority}
                      size="small"
                      color={getPriorityColor(task.priority) as any}
                      sx={{ mr: 1 }}
                    />
                    <Chip label={task.category.name} size="small" />
                  </Box>
                </Box>
                {task.notes && (
                  <Typography variant="body2" color="text.secondary">
                    {task.notes}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                {task.status === "pending" && (
                  <Button
                    size="small"
                    onClick={() =>
                      handleUpdateTask(task.id, { status: "completed" })
                    }
                  >
                    Complete
                  </Button>
                )}
                <Button size="small" onClick={() => setEditDialog(task)}>
                  Edit
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDeleteTask(task.id)}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          ))}

          {filteredTasks.length === 0 && (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">
                No tasks yet. Add some notes above to get started!
              </Typography>
            </Paper>
          )}
        </Stack>
      </Container>

      {/* Edit Dialog */}
      {editDialog && (
        <Dialog
          open={!!editDialog}
          onClose={() => setEditDialog(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Task</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Title"
              value={editDialog.title}
              onChange={(e) =>
                setEditDialog({ ...editDialog, title: e.target.value })
              }
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Priority</InputLabel>
              <Select
                value={editDialog.priority}
                onChange={(e) =>
                  setEditDialog({
                    ...editDialog,
                    priority: e.target.value as any,
                  })
                }
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
                onChange={(e) =>
                  setEditDialog({
                    ...editDialog,
                    status: e.target.value as any,
                  })
                }
                label="Status"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={editDialog.notes || ""}
              onChange={(e) =>
                setEditDialog({ ...editDialog, notes: e.target.value })
              }
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialog(null)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() =>
                handleUpdateTask(editDialog.id, {
                  title: editDialog.title,
                  priority: editDialog.priority,
                  status: editDialog.status,
                  notes: editDialog.notes,
                })
              }
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default Dashboard;
