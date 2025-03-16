import { createNewCommunity } from "../../controller/_private/community/createNewCommiunity.controller.js";
import { Router } from "express";

const community = Router()

community.route('/createNewCommunity').post(createNewCommunity)

export { community }