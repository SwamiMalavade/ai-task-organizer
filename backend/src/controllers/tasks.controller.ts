import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database';
import aiService from '../services/ai.service';
import { AuthRequest } from '../middleware/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface TaskRow extends RowDataPacket {
  id: number;
  user_id: number;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  category_id: number;
  category_name: string;
  category_color: string;
  status: 'pending' | 'completed';
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  completed_at: Date | null;
}

interface CategoryRow extends RowDataPacket {
  id: number;
  name: string;
  color: string;
}

export const parseNotesValidation = [
  body('rawNotes')
    .trim()
    .notEmpty()
    .withMessage('Task notes cannot be empty')
    .isLength({ min: 3, max: 5000 })
    .withMessage('Task notes must be between 3 and 5000 characters')
];

export const parseNotes = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rawNotes } = req.body;
    const userId = req.userId!;

    await pool.query(
      'INSERT INTO raw_notes (user_id, raw_text) VALUES (?, ?)',
      [userId, rawNotes]
    );

    const parsedTasks = await aiService.parseTasksFromNotes(rawNotes);

    const [categories] = await pool.query<CategoryRow[]>(
      'SELECT id, name FROM categories'
    );

    const categoryMap = new Map(categories.map(cat => [cat.name, cat.id]));

    const taskIds: number[] = [];
    for (const task of parsedTasks) {
      const categoryId = categoryMap.get(task.category) || categoryMap.get('Other')!;
      
      const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO tasks (user_id, title, priority, category_id) VALUES (?, ?, ?, ?)',
        [userId, task.title, task.priority, categoryId]
      );
      
      taskIds.push(result.insertId);
    }

    if (taskIds.length > 0) {
      const placeholders = taskIds.map(() => '?').join(',');
      const [tasks] = await pool.query<TaskRow[]>(
        `SELECT t.*, c.name as category_name, c.color as category_color
         FROM tasks t
         LEFT JOIN categories c ON t.category_id = c.id
         WHERE t.id IN (${placeholders})`,
        taskIds
      );

      res.json({
        message: 'Tasks parsed successfully',
        tasks: tasks.map(formatTask)
      });
    } else {
      res.json({ message: 'No tasks parsed', tasks: [] });
    }
  } catch (error: any) {
    const errorMessage = error.message || 'Failed to parse notes';
    res.status(500).json({ error: errorMessage });
  }
};

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { status, priority, category } = req.query;

    let query = `
      SELECT t.*, c.name as category_name, c.color as category_color
      FROM tasks t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
    `;
    const params: any[] = [userId];

    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }
    if (priority) {
      query += ' AND t.priority = ?';
      params.push(priority);
    }
    if (category) {
      query += ' AND c.name = ?';
      params.push(category);
    }

    query += ' ORDER BY t.created_at DESC';

    const [tasks] = await pool.query<TaskRow[]>(query, params);

    res.json({
      tasks: tasks.map(formatTask)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const taskId = parseInt(req.params.id);
    const { status, priority, title, notes } = req.body;

    const [tasks] = await pool.query<TaskRow[]>(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, userId]
    );

    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
      if (status === 'completed') {
        updates.push('completed_at = NOW()');
      }
    }
    if (priority !== undefined) {
      updates.push('priority = ?');
      params.push(priority);
    }
    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    params.push(taskId);

    await pool.query(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const [updatedTasks] = await pool.query<TaskRow[]>(
      `SELECT t.*, c.name as category_name, c.color as category_color
       FROM tasks t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.id = ?`,
      [taskId]
    );

    res.json({
      message: 'Task updated successfully',
      task: formatTask(updatedTasks[0])
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const taskId = parseInt(req.params.id);

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

export const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const [categories] = await pool.query<CategoryRow[]>(
      'SELECT id, name, color FROM categories ORDER BY name'
    );

    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

function formatTask(task: TaskRow) {
  return {
    id: task.id,
    title: task.title,
    priority: task.priority,
    status: task.status,
    category: {
      id: task.category_id,
      name: task.category_name,
      color: task.category_color
    },
    notes: task.notes,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
    completedAt: task.completed_at
  };
}
