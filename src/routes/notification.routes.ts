import { Router } from 'express';

const router = Router();

// Notification routes
router.get('/', (req, res) => {
  res.json({ message: 'Get notifications - To be implemented' });
});

router.put('/:id/read', (req, res) => {
  res.json({ message: 'Mark notification as read - To be implemented' });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete notification - To be implemented' });
});

router.put('/read-all', (req, res) => {
  res.json({ message: 'Mark all as read - To be implemented' });
});

export default router; 