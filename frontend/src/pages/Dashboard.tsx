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
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa" }}>
      {/* Elegant Header */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          bgcolor: "#fff",
          color: "#1a1a1a",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Toolbar sx={{ py: 1.5 }}>
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 600,
              color: "#2563eb",
              letterSpacing: "-0.5px"
            }}
          >
            AI Task Organizer
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              mr: 3,
              color: "text.secondary",
              fontWeight: 500
            }}
          >
            {user?.name}
          </Typography>
          <Button 
            variant="outlined"
            color="inherit" 
            onClick={logout} 
            startIcon={<LogoutIcon />}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              borderColor: "#e0e0e0",
              color: "#666",
              "&:hover": {
                borderColor: "#2563eb",
                bgcolor: "rgba(37, 99, 235, 0.04)"
              }
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        {/* AI Input Section */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            mb: 4,
            borderRadius: 3,
            border: "1px solid #e0e0e0",
            bgcolor: "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}
        >
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              fontWeight: 600,
              color: "#1a1a1a",
              mb: 2
            }}
          >
            ✨ AI-Powered Task Parser
          </Typography>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                borderRadius: 2,
                border: "1px solid #fee",
              }}
            >
              {error}
            </Alert>
          )}
          {success && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 2,
                borderRadius: 2,
                border: "1px solid #d4edda",
              }}
            >
              {success}
            </Alert>
          )}

          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Example: Finish report by Friday, call client, review code..."
            value={rawNotes}
            onChange={(e) => setRawNotes(e.target.value)}
            sx={{ 
              mb: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "#fafafa",
                "&:hover": {
                  bgcolor: "#fff",
                },
                "&.Mui-focused": {
                  bgcolor: "#fff",
                }
              }
            }}
          />
          <Button
            variant="contained"
            size="large"
            onClick={handleParseNotes}
            disabled={loading}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              bgcolor: "#2563eb",
              boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
              "&:hover": {
                bgcolor: "#1d4ed8",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.35)",
              }
            }}
          >
            {loading ? "Processing..." : "Parse Tasks with AI"}
          </Button>
        </Paper>

        {/* Filter Bar */}
        <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
            Filter:
          </Typography>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              sx={{
                borderRadius: 2,
                bgcolor: "#fff",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#e0e0e0",
                }
              }}
            >
              <MenuItem value="all">All Tasks</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" sx={{ ml: "auto", color: "text.secondary" }}>
            {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"}
          </Typography>
        </Box>

        {/* Tasks List */}
        <Stack spacing={2.5}>
          {filteredTasks.map((task) => (
            <Card 
              key={task.id}
              elevation={0}
              sx={{
                border: "1px solid #e0e0e0",
                borderRadius: 3,
                bgcolor: "#fff",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  transform: "translateY(-2px)",
                  borderColor: "#2563eb",
                }
              }}
            >
              <CardContent sx={{ pb: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 1.5 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      textDecoration: task.status === "completed" ? "line-through" : "none",
                      color: task.status === "completed" ? "text.secondary" : "#1a1a1a",
                      fontWeight: 600,
                      fontSize: "1.1rem",
                      flex: 1,
                      mr: 2
                    }}
                  >
                    {task.title}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Chip 
                      label={task.priority} 
                      size="small" 
                      color={getPriorityColor(task.priority) as any}
                      sx={{ 
                        fontWeight: 600,
                        fontSize: "0.75rem"
                      }}
                    />
                    <Chip 
                      label={task.category.name} 
                      size="small"
                      sx={{
                        bgcolor: "#f3f4f6",
                        color: "#6b7280",
                        fontWeight: 600,
                        fontSize: "0.75rem"
                      }}
                    />
                  </Box>
                </Box>
                {task.notes && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      mt: 1,
                      pl: 0,
                      lineHeight: 1.6
                    }}
                  >
                    {task.notes}
                  </Typography>
                )}
              </CardContent>
              <CardActions sx={{ px: 2, pb: 2, pt: 1 }}>
                {task.status === "pending" && (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleUpdateTask(task.id, { status: "completed" })}
                    sx={{
                      textTransform: "none",
                      borderRadius: 1.5,
                      px: 2,
                      fontWeight: 600,
                      bgcolor: "#10b981",
                      "&:hover": {
                        bgcolor: "#059669",
                      }
                    }}
                  >
                    Complete
                  </Button>
                )}
                <Button 
                  size="small" 
                  onClick={() => setEditDialog(task)}
                  sx={{
                    textTransform: "none",
                    color: "#6b7280",
                    fontWeight: 500,
                    "&:hover": {
                      bgcolor: "rgba(0,0,0,0.04)",
                    }
                  }}
                >
                  Edit
                </Button>
                <Button 
                  size="small" 
                  color="error" 
                  onClick={() => handleDeleteTask(task.id)}
                  sx={{
                    textTransform: "none",
                    fontWeight: 500,
                    "&:hover": {
                      bgcolor: "rgba(239, 68, 68, 0.08)",
                    }
                  }}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          ))}

          {filteredTasks.length === 0 && (
            <Paper 
              elevation={0}
              sx={{ 
                p: 8, 
                textAlign: "center",
                borderRadius: 3,
                border: "2px dashed #e0e0e0",
                bgcolor: "#fafafa"
              }}
            >
              <Typography 
                variant="h6" 
                color="text.secondary"
                sx={{ mb: 1, fontWeight: 500 }}
              >
                No tasks yet
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Add some notes above and let AI organize them for you!
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
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle sx={{ fontWeight: 600 }}>Edit Task</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Title"
              value={editDialog.title}
              onChange={(e) =>
                setEditDialog({ ...editDialog, title: e.target.value })
              }
              margin="normal"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                }
              }}
            />
            <FormControl fullWidth margin="normal">
              <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>Priority</Typography>
              <Select
                value={editDialog.priority}
                onChange={(e) =>
                  setEditDialog({
                    ...editDialog,
                    priority: e.target.value as any,
                  })
                }
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>Status</Typography>
              <Select
                value={editDialog.status}
                onChange={(e) =>
                  setEditDialog({
                    ...editDialog,
                    status: e.target.value as any,
                  })
                }
                sx={{ borderRadius: 2 }}
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
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={() => setEditDialog(null)}
              sx={{ textTransform: "none" }}
            >
              Cancel
            </Button>
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
              sx={{
                borderRadius: 2,
                textTransform: "none",
                px: 3,
                bgcolor: "#2563eb",
                "&:hover": {
                  bgcolor: "#1d4ed8",
                }
              }}
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
