import { previewDeduct } from '../../controller/preview/previewDeduct.js';
import { createSession } from '../../controller/preview/createSession.controller.js';
import { Router } from 'express';
const previewRoute = Router();

previewRoute.route('/createSession').get(createSession);
previewRoute.route('/deduct').get(previewDeduct);

export { previewRoute };