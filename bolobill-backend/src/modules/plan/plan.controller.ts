import {Request, Response} from 'express';
import fs from 'fs';
import path from 'path';
import {v4 as uuidv4} from 'uuid';
import {asyncHandler} from '../../common/asyncHandler';
import {planService} from './plan.service';

function processBase64Icon(iconRaw: string, hostUrl: string): string {
  if (iconRaw && iconRaw.startsWith('data:image/')) {
    const matches = iconRaw.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return iconRaw;
    }
    const extRaw = matches[1].split('/')[1] || 'png';
    const ext = extRaw === 'jpeg' ? 'jpg' : extRaw;
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    const plansDir = path.join(process.cwd(), 'storage', 'plans');
    if (!fs.existsSync(plansDir)) {
      fs.mkdirSync(plansDir, { recursive: true });
    }
    
    const filename = `icon-${uuidv4()}.${ext}`;
    fs.writeFileSync(path.join(plansDir, filename), buffer);
    return `${hostUrl}/api/files/plans/${filename}`;
  }
  return iconRaw;
}

export const planController = {
  // Public or user-facing list
  list: asyncHandler(async (req: Request, res: Response) => {
    const plans = await planService.list();
    return res.json({plans});
  }),

  // Admin list
  listAdmin: asyncHandler(async (req: Request, res: Response) => {
    const plans = await planService.listAllAdmin();
    return res.json({plans});
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const hostUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    if (req.body.icon) {
      req.body.icon = processBase64Icon(req.body.icon, hostUrl);
    }
    const plan = await planService.create(req.body);
    return res.status(201).json({plan});
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    // support both array or string logic because frontend sometimes sends arrays
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const hostUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    if (req.body.icon) {
      req.body.icon = processBase64Icon(req.body.icon, hostUrl);
    }
    const plan = await planService.update(id as string, req.body);
    return res.json({plan});
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await planService.delete(id as string);
    return res.json({message: 'Plan deleted or deactivated'});
  }),
};
