import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        bgcolor: '#f8f9fa',
      }}
    >
      <Container maxWidth="xs">
        <Paper 
          elevation={0}
          sx={{ 
            p: 5,
            borderRadius: 3,
            border: '1px solid #e0e0e0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
        >
          <Typography 
            variant="h4" 
            align="center" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              color: '#2563eb',
              mb: 1
            }}
          >
            AI Task Organizer
          </Typography>
          <Typography 
            variant="body2" 
            align="center" 
            color="text.secondary" 
            sx={{ 
              mb: 4,
              fontWeight: 500
            }}
          >
            Sign in to your account
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                border: '1px solid #fee'
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ 
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ 
                mb: 3.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                bgcolor: '#2563eb',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                '&:hover': {
                  bgcolor: '#1d4ed8',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
                }
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                style={{ 
                  textDecoration: 'none', 
                  color: '#2563eb',
                  fontWeight: 600
                }}
              >
                Sign Up
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
