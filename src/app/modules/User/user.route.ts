  import express from "express";
  import validateRequest from "../../middlewares/validateRequest";
  import { UserValidation } from "./user.validation";
  import { userController } from "./user.controller";
  import auth from "../../middlewares/auth";
  import { UserRole } from "@prisma/client";
  import { fileUploader } from "../../../helpars/fileUploader";

  const router = express.Router();

  // *!register user
  router.post(
    "/register",
    validateRequest(UserValidation.CreateUserValidationSchema),
    userController.createUser
  );
  // *!get all  user
  // router.get("/", userController.getUsers);

  
  // *!complete profile with image
  router.put(
    "/complete-profile",
    auth(UserRole.ADMIN, UserRole.USER),
    fileUploader.uploadSingle,
    validateRequest(UserValidation.completeProfileSchema),
    userController.completeProfile
  );
  
  // *!profile user
  router.put(
    "/profile",
    auth(UserRole.ADMIN, UserRole.USER),
    fileUploader.uploadSingle,
    validateRequest(UserValidation.userUpdateSchema),
    userController.updateProfile
  );



  // *!update  user
  router.put("/:id", validateRequest(UserValidation.userUpdateSchema), userController.updateUser);

  export const userRoutes = router;
