package controllers

import (
	"flowershop/database"
	"flowershop/middleware"
	"flowershop/models"
	"flowershop/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

type FavoriteController struct{}

func (fc *FavoriteController) GetList(c *gin.Context) {
	userID := middleware.GetUserID(c)
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var total int64
	var favorites []models.Favorite

	query := database.DB.Model(&models.Favorite{}).Where("user_id = ?", userID)
	query.Count(&total)

	offset := (page - 1) * pageSize
	query.Preload("Flower").Order("created_at desc").Offset(offset).Limit(pageSize).Find(&favorites)

	utils.SuccessPage(c, favorites, total, page, pageSize)
}

func (fc *FavoriteController) Add(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var req struct {
		FlowerID uint `json:"flower_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var existing models.Favorite
	if err := database.DB.Where("user_id = ? AND flower_id = ?", userID, req.FlowerID).First(&existing).Error; err == nil {
		utils.BadRequest(c, "已收藏")
		return
	}

	favorite := models.Favorite{
		UserID:   userID,
		FlowerID: req.FlowerID,
	}

	if err := database.DB.Create(&favorite).Error; err != nil {
		utils.ServerError(c, "收藏失败")
		return
	}

	utils.Success(c, gin.H{"id": favorite.ID})
}

func (fc *FavoriteController) Delete(c *gin.Context) {
	id := c.Param("id")
	userID := middleware.GetUserID(c)

	var favorite models.Favorite
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&favorite).Error; err != nil {
		utils.NotFound(c, "收藏不存在")
		return
	}

	database.DB.Delete(&favorite)
	utils.Success(c, nil)
}

func (fc *FavoriteController) Toggle(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var req struct {
		FlowerID uint `json:"flower_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var existing models.Favorite
	if err := database.DB.Where("user_id = ? AND flower_id = ?", userID, req.FlowerID).First(&existing).Error; err == nil {
		database.DB.Delete(&existing)
		utils.Success(c, gin.H{"is_favorite": false})
		return
	}

	favorite := models.Favorite{
		UserID:   userID,
		FlowerID: req.FlowerID,
	}

	database.DB.Create(&favorite)
	utils.Success(c, gin.H{"is_favorite": true})
}

func (fc *FavoriteController) Check(c *gin.Context) {
	userID := middleware.GetUserID(c)
	flowerID := c.Query("flower_id")

	var count int64
	database.DB.Model(&models.Favorite{}).Where("user_id = ? AND flower_id = ?", userID, flowerID).Count(&count)

	utils.Success(c, gin.H{"is_favorite": count > 0})
}
