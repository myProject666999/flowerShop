package controllers

import (
	"flowershop/database"
	"flowershop/middleware"
	"flowershop/models"
	"flowershop/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type MerchantController struct{}

func (mc *MerchantController) Login(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var merchant models.Merchant
	if err := database.DB.Where("username = ?", req.Username).First(&merchant).Error; err != nil {
		utils.BadRequest(c, "用户名或密码错误")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(merchant.Password), []byte(req.Password)); err != nil {
		utils.BadRequest(c, "用户名或密码错误")
		return
	}

	if merchant.Status != models.StatusActive {
		utils.BadRequest(c, "账号已被禁用")
		return
	}

	token, err := utils.GenerateToken(merchant.ID, merchant.Username, "merchant")
	if err != nil {
		utils.ServerError(c, "生成token失败")
		return
	}

	utils.Success(c, gin.H{
		"token": token,
		"merchant": gin.H{
			"id":        merchant.ID,
			"username":  merchant.Username,
			"shop_name": merchant.ShopName,
			"phone":     merchant.Phone,
			"email":     merchant.Email,
			"avatar":    merchant.Avatar,
			"address":   merchant.Address,
		},
	})
}

func (mc *MerchantController) GetProfile(c *gin.Context) {
	merchantID := middleware.GetUserID(c)

	var merchant models.Merchant
	if err := database.DB.First(&merchant, merchantID).Error; err != nil {
		utils.NotFound(c, "商家不存在")
		return
	}

	utils.Success(c, gin.H{
		"id":        merchant.ID,
		"username":  merchant.Username,
		"shop_name": merchant.ShopName,
		"phone":     merchant.Phone,
		"email":     merchant.Email,
		"avatar":    merchant.Avatar,
		"address":   merchant.Address,
	})
}

func (mc *MerchantController) UpdateProfile(c *gin.Context) {
	merchantID := middleware.GetUserID(c)

	var req struct {
		ShopName string `json:"shop_name"`
		Phone    string `json:"phone"`
		Email    string `json:"email"`
		Avatar   string `json:"avatar"`
		Address  string `json:"address"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	updates := make(map[string]interface{})
	if req.ShopName != "" {
		updates["shop_name"] = req.ShopName
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
	if req.Address != "" {
		updates["address"] = req.Address
	}

	if err := database.DB.Model(&models.Merchant{}).Where("id = ?", merchantID).Updates(updates).Error; err != nil {
		utils.ServerError(c, "更新失败")
		return
	}

	utils.Success(c, nil)
}

func (mc *MerchantController) UpdatePassword(c *gin.Context) {
	merchantID := middleware.GetUserID(c)

	var req struct {
		OldPassword string `json:"old_password" binding:"required"`
		NewPassword string `json:"new_password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var merchant models.Merchant
	if err := database.DB.First(&merchant, merchantID).Error; err != nil {
		utils.NotFound(c, "商家不存在")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(merchant.Password), []byte(req.OldPassword)); err != nil {
		utils.BadRequest(c, "原密码错误")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		utils.ServerError(c, "密码加密失败")
		return
	}

	merchant.Password = string(hashedPassword)
	if err := database.DB.Save(&merchant).Error; err != nil {
		utils.ServerError(c, "更新密码失败")
		return
	}

	utils.Success(c, nil)
}
