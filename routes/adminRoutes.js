import express from "express"
import { authorize } from "../middlewares/authorize.js";
import authMiddleware from "../middlewares/authMiddlewares.js";
import { createAdmin } from "../controller/admin.js";
import { getAdminStats, getAllUsers, getLast7DaysOrders, getRecentData, getWeeklyStats, toggleBlockUser } from "../controller/getAdminStats.js";
import { deleteUser } from "../controller/updateUser.js";
const router = express.Router();

router.post("/create-admin",authMiddleware,
    authorize("SUPER_ADMIN"),
    createAdmin)
router.get("/stats",authMiddleware,
    authorize( "SUPER_ADMIN",
      "USER_ADMIN",
      "PRODUCT_ADMIN",),
      getAdminStats
 )
 router.get("/recent", authMiddleware,
    authorize( "SUPER_ADMIN",
      "USER_ADMIN",
      "PRODUCT_ADMIN",),
      getRecentData
 )

 router.get("/users",authMiddleware,
    authorize( "SUPER_ADMIN",
      "USER_ADMIN",),getAllUsers)

router.delete('/user/:id',
  authMiddleware,
    authorize( "SUPER_ADMIN",
      "USER_ADMIN",),deleteUser
);


router.patch("/user/block/:id",
  authMiddleware,
    authorize( "SUPER_ADMIN",
      "USER_ADMIN",),toggleBlockUser
)


router.get(
  "/dashboard/weekly-stats",
  authMiddleware,
  authorize("SUPER_ADMIN",
      "USER_ADMIN",
      "PRODUCT_ADMIN",),
  getWeeklyStats
);



router.get(
  "/dashboard/orders-last-7-days",
  authMiddleware,
  authorize("SUPER_ADMIN","USER_ADMIN",
      "PRODUCT_ADMIN", "ORDER_ADMIN"),
  getLast7DaysOrders
);

export default router;