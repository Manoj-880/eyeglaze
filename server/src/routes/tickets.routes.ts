import { Router } from 'express';
import { createTicket, getUserTickets, getTicketById } from '../controllers/tickets.controller';

const router = Router();

router.post('/', createTicket);
router.get('/', getUserTickets);
router.get('/:id', getTicketById);

export default router;
