package controllers

import (
	"flowershop/database"
	"flowershop/middleware"
	"flowershop/models"
	"flowershop/utils"

	"github.com/gin-gonic/gin"
)

type CartController struct{}

func (cc *CartController) GetList(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var carts []models.Cart
	database.DB.Preload("Flower").Where("user_id = ?", userID).Find(&carts)

	var totalAmount float64
	for _, cart := range carts {
		if cart.Flower != nil {
			totalAmount += cart.Flower.Price * float64(cart.Quantity)
		}
	}

	utils.Success(c, gin.H{
		"list":         carts,
		"total_amount": totalAmount,
	})
}

func (cc *CartController) Add(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var req struct {
		FlowerID uint `json:"flower_id" binding:"required"`
		Quantity int  `json:"quantity"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if req.Quantity <= 0 {
		req.Quantity = 1
	}

	var flower models.Flower
	if err := database.DB.First(&flower, req.FlowerID).Error; err != nil {
		utils.NotFound(c, "鲜花不存在")
		return
	}

	if flower.Status != models.StatusActive {
		utils.BadRequest(c, "鲜花已下架")
		return
	}

	var existingCart models.Cart
	if err := database.DB.Where("user_id = ? AND flower_id = ?", userID, req.FlowerID).First(&existingCart).Error; err == nil {
		existingCart.Quantity += req.Quantity
		database.DB.Save(&existingCart)
		utils.Success(c, gin.H{"id": existingCart.ID})
		return
	}

	cart := models.Cart{
		UserID:   userID,
		FlowerID: req.FlowerID,
		Quantity: req.Quantity,
	}

	if err := database.DB.Create(&cart).Error; err != nil {
		utils.ServerError(c, "添加失败")
		return
	}

	utils.Success(c, gin.H{"id": cart.ID})
}

func (cc *CartController) Update(c *gin.Context) {
	id := c.Param("id")
	userID := middleware.GetUserID(c)

	var req struct {
		Quantity int `json:"quantity" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var cart models.Cart
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&cart).Error; err != nil {
		utils.NotFound(c, "购物车项不存在")
		return
	}

	if req.Quantity <= 0 {
		database.DB.Delete(&cart)
		utils.Success(c, nil)
		return
	}

	cart.Quantity = req.Quantity
	database.DB.Save(&cart)

	utils.Success(c, nil)
}

func (cc *CartController) Delete(c *gin.Context) {
	id := c.Param("id")
	userID := middleware.GetUserID(c)

	var cart models.Cart
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&cart).Error; err != nil {
		utils.NotFound(c, "购物车项不存在")
		return
	}

	database.DB.Delete(&cart)
	utils.Success(c, nil)
}

func (cc *CartController) BatchDelete(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var req struct {
		IDs []uint `json:"ids" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	database.DB.Where("user_id = ? AND id IN ?", userID, req.IDs).Delete(&models.Cart{})
	utils.Success(c, nil)
}
