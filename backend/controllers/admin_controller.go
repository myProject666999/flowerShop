package controllers

import (
	"flowershop/database"
	"flowershop/middleware"
	"flowershop/models"
	"flowershop/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type AdminController struct{}

func (ac *AdminController) Login(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var admin models.Admin
	if err := database.DB.Where("username = ?", req.Username).First(&admin).Error; err != nil {
		utils.BadRequest(c, "用户名或密码错误")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(admin.Password), []byte(req.Password)); err != nil {
		utils.BadRequest(c, "用户名或密码错误")
		return
	}

	token, err := utils.GenerateToken(admin.ID, admin.Username, "admin")
	if err != nil {
		utils.ServerError(c, "生成token失败")
		return
	}

	utils.Success(c, gin.H{
		"token": token,
		"admin": gin.H{
			"id":       admin.ID,
			"username": admin.Username,
			"nickname": admin.Nickname,
			"phone":    admin.Phone,
			"email":    admin.Email,
			"avatar":   admin.Avatar,
			"role":     admin.Role,
		},
	})
}

func (ac *AdminController) GetProfile(c *gin.Context) {
	adminID := middleware.GetUserID(c)

	var admin models.Admin
	if err := database.DB.First(&admin, adminID).Error; err != nil {
		utils.NotFound(c, "管理员不存在")
		return
	}

	utils.Success(c, gin.H{
		"id":       admin.ID,
		"username": admin.Username,
		"nickname": admin.Nickname,
		"phone":    admin.Phone,
		"email":    admin.Email,
		"avatar":   admin.Avatar,
		"role":     admin.Role,
	})
}

func (ac *AdminController) UpdateProfile(c *gin.Context) {
	adminID := middleware.GetUserID(c)

	var req struct {
		Nickname string `json:"nickname"`
		Phone    string `json:"phone"`
		Email    string `json:"email"`
		Avatar   string `json:"avatar"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	updates := make(map[string]interface{})
	if req.Nickname != "" {
		updates["nickname"] = req.Nickname
	}
	if req.Phone != "" {
		updates["phone"] = req.Phone
	}
	if req.Email != "" {
		updates["email"] = req.Email
	}
	if req.Avatar != "" {
		updates["avatar"] = req.Avatar
	}

	if err := database.DB.Model(&models.Admin{}).Where("id = ?", adminID).Updates(updates).Error; err != nil {
		utils.ServerError(c, "更新失败")
		return
	}

	utils.Success(c, nil)
}

func (ac *AdminController) UpdatePassword(c *gin.Context) {
	adminID := middleware.GetUserID(c)

	var req struct {
		OldPassword string `json:"old_password" binding:"required"`
		NewPassword string `json:"new_password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var admin models.Admin
	if err := database.DB.First(&admin, adminID).Error; err != nil {
		utils.NotFound(c, "管理员不存在")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(admin.Password), []byte(req.OldPassword)); err != nil {
		utils.BadRequest(c, "原密码错误")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		utils.ServerError(c, "密码加密失败")
		return
	}

	admin.Password = string(hashedPassword)
	if err := database.DB.Save(&admin).Error; err != nil {
		utils.ServerError(c, "更新密码失败")
		return
	}

	utils.Success(c, nil)
}

func (ac *AdminController) GetDashboardStats(c *gin.Context) {
	var userCount, orderCount, categoryCount int64
	var totalSales float64

	database.DB.Model(&models.User{}).Count(&userCount)
	database.DB.Model(&models.Order{}).Where("status >= ?", models.OrderStatusPaid).Count(&orderCount)
	database.DB.Model(&models.Category{}).Where("status = ?", models.StatusActive).Count(&categoryCount)

	database.DB.Model(&models.Order{}).Where("pay_status = ?", models.PayStatusPaid).Select("COALESCE(SUM(pay_amount), 0)").Scan(&totalSales)

	var recentOrders []models.Order
	database.DB.Order("created_at desc").Limit(10).Find(&recentOrders)

	utils.Success(c, gin.H{
		"user_count":     userCount,
		"order_count":    orderCount,
		"category_count": categoryCount,
		"total_sales":    totalSales,
		"recent_orders":  recentOrders,
	})
}
