package routes

import (
	"flowershop/controllers"
	"flowershop/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	userController := &controllers.UserController{}
	merchantController := &controllers.MerchantController{}
	adminController := &controllers.AdminController{}
	flowerController := &controllers.FlowerController{}
	orderController := &controllers.OrderController{}
	cartController := &controllers.CartController{}
	favoriteController := &controllers.FavoriteController{}
	addressController := &controllers.AddressController{}
	announcementController := &controllers.AnnouncementController{}
	bannerController := &controllers.BannerController{}
	userAdminController := &controllers.UserAdminController{}

	api := r.Group("/api")
	{
		api.POST("/user/register", userController.Register)
		api.POST("/user/login", userController.Login)

		api.POST("/merchant/login", merchantController.Login)

		api.POST("/admin/login", adminController.Login)

		api.GET("/flowers", flowerController.GetList)
		api.GET("/flowers/:id", flowerController.GetDetail)
		api.GET("/categories", flowerController.GetCategories)
		api.GET("/banners", flowerController.GetBanners)
		api.GET("/announcements", flowerController.GetAnnouncements)
	}

	user := api.Group("/user")
	user.Use(middleware.UserAuth())
	{
		user.GET("/profile", userController.GetProfile)
		user.PUT("/profile", userController.UpdateProfile)
		user.PUT("/password", userController.UpdatePassword)

		user.GET("/cart", cartController.GetList)
		user.POST("/cart", cartController.Add)
		user.PUT("/cart/:id", cartController.Update)
		user.DELETE("/cart/:id", cartController.Delete)
		user.DELETE("/cart", cartController.BatchDelete)

		user.GET("/favorites", favoriteController.GetList)
		user.POST("/favorites", favoriteController.Add)
		user.DELETE("/favorites/:id", favoriteController.Delete)
		user.POST("/favorites/toggle", favoriteController.Toggle)
		user.GET("/favorites/check", favoriteController.Check)

		user.GET("/addresses", addressController.GetList)
		user.GET("/addresses/default", addressController.GetDefault)
		user.GET("/addresses/:id", addressController.GetDetail)
		user.POST("/addresses", addressController.Create)
		user.PUT("/addresses/:id", addressController.Update)
		user.DELETE("/addresses/:id", addressController.Delete)
		user.PUT("/addresses/:id/default", addressController.SetDefault)

		user.GET("/orders", orderController.GetUserOrders)
		user.GET("/orders/:id", orderController.GetOrderDetail)
		user.POST("/orders", orderController.CreateOrder)
		user.POST("/orders/:id/pay", orderController.PayOrder)
		user.POST("/orders/:id/complete", orderController.CompleteOrder)
		user.POST("/orders/:id/cancel", orderController.CancelOrder)
	}

	merchant := api.Group("/merchant")
	merchant.Use(middleware.MerchantAuth())
	{
		merchant.GET("/profile", merchantController.GetProfile)
		merchant.PUT("/profile", merchantController.UpdateProfile)
		merchant.PUT("/password", merchantController.UpdatePassword)

		merchant.GET("/flowers", flowerController.GetMerchantFlowers)
		merchant.POST("/flowers", flowerController.CreateFlower)
		merchant.PUT("/flowers/:id", flowerController.UpdateFlower)
		merchant.DELETE("/flowers/:id", flowerController.DeleteFlower)

		merchant.GET("/orders", orderController.GetMerchantOrders)
		merchant.GET("/orders/:id", orderController.GetOrderDetail)
		merchant.POST("/orders/:id/deliver", orderController.DeliverOrder)
	}

	admin := api.Group("/admin")
	admin.Use(middleware.AdminAuth())
	{
		admin.GET("/dashboard", adminController.GetDashboardStats)

		admin.GET("/profile", adminController.GetProfile)
		admin.PUT("/profile", adminController.UpdateProfile)
		admin.PUT("/password", adminController.UpdatePassword)

		admin.GET("/users", userAdminController.GetUsers)
		admin.GET("/users/:id", userAdminController.GetUserDetail)
		admin.POST("/users", userAdminController.CreateUser)
		admin.PUT("/users/:id", userAdminController.UpdateUser)
		admin.POST("/users/:id/reset-password", userAdminController.ResetPassword)
		admin.DELETE("/users/:id", userAdminController.DeleteUser)

		admin.GET("/flowers", flowerController.GetList)
		admin.POST("/flowers", flowerController.CreateFlower)
		admin.PUT("/flowers/:id", flowerController.UpdateFlower)
		admin.DELETE("/flowers/:id", flowerController.DeleteFlower)

		admin.GET("/categories", flowerController.GetCategories)
		admin.POST("/categories", flowerController.CreateCategory)
		admin.PUT("/categories/:id", flowerController.UpdateCategory)
		admin.DELETE("/categories/:id", flowerController.DeleteCategory)

		admin.GET("/orders", orderController.GetAllOrders)
		admin.GET("/orders/:id", orderController.GetOrderDetail)

		admin.GET("/announcements", announcementController.GetList)
		admin.GET("/announcements/:id", announcementController.GetDetail)
		admin.POST("/announcements", announcementController.Create)
		admin.PUT("/announcements/:id", announcementController.Update)
		admin.DELETE("/announcements/:id", announcementController.Delete)

		admin.GET("/banners", bannerController.GetAll)
		admin.POST("/banners", bannerController.Create)
		admin.PUT("/banners/:id", bannerController.Update)
		admin.DELETE("/banners/:id", bannerController.Delete)
	}

	return r
}
