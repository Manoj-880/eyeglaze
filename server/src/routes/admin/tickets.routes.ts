import { Router } from 'express';
import { adminGetAllTickets, adminUpdateTicket } from '../../controllers/admin/tickets.controller';

const router = Router();

router.get('/', adminGetAllTickets);
router.put('/:id', adminUpdateTicket);

export default router;
