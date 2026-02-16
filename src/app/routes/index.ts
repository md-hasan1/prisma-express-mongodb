import express from "express";
import { userRoutes } from "../modules/User/user.route";
import { AuthRoutes } from "../modules/Auth/auth.routes";

import productRoutes from '../modules/Product/product.route';



const router = express.Router();

const moduleRoutes = [
  {
    path: "/users",
    route: userRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },

  {
    path: "/products",
    route: productRoutes,
  },


];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
