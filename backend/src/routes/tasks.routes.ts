import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  parseNotes,
  getTasks,
  updateTask,
  deleteTask,
  getCategories,
  parseNotesValidation
} from '../controllers/tasks.controller';

const router = Router();

router.use(authenticate);

router.post('/parse', parseNotesValidation, parseNotes);
router.get('/', getTasks);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);
router.get('/categories', getCategories);

export default router;
