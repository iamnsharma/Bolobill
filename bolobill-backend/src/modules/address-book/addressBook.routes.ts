import {Router} from 'express';
import {authMiddleware} from '../../middleware/auth.middleware';
import {adminMiddleware} from '../../middleware/admin.middleware';
import {addressBookController} from './addressBook.controller';

export const addressBookRouter = Router();

addressBookRouter.use(authMiddleware, adminMiddleware);

addressBookRouter.get('/lookup', addressBookController.lookup);
addressBookRouter.get('/', addressBookController.list);
addressBookRouter.post('/', addressBookController.upsert);
addressBookRouter.delete('/:id', addressBookController.remove);
