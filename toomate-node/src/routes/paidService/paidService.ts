import { checkSubscription } from '../../middleware/checkSubscription.js'
import {Router} from 'express'

const paidService = Router()

paidService.use(checkSubscription);

export {paidService};