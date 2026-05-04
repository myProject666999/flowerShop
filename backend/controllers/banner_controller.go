package controllers

import (
	"flowershop/database"
	"flowershop/models"
	"flowershop/utils"

	"github.com/gin-gonic/gin"
)

type BannerController struct{}

func (bc *BannerController) GetList(c *gin.Context) {
	var banners []models.Banner
	database.DB.Where("status = ?", models.StatusActive).Order("sort asc").Find(&banners)
	utils.Success(c, banners)
}

func (bc *BannerController) GetAll(c *gin.Context) {
	var banners []models.Banner
	database.DB.Order("sort asc, created_at desc").Find(&banners)
	utils.Success(c, banners)
}

func (bc *BannerController) Create(c *gin.Context) {
	var req struct {
		Title    string `json:"title"`
		Image    string `json:"image" binding:"required"`
		Link     string `json:"link"`
		FlowerID uint   `json:"flower_id"`
		Sort     int    `json:"sort"`
		Status   int    `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	banner := models.Banner{
		Title:    req.Title,
		Image:    req.Image,
		Link:     req.Link,
		FlowerID: req.FlowerID,
		Sort:     req.Sort,
		Status:   req.Status,
	}
	if banner.Status == 0 {
		banner.Status = models.StatusActive
	}

	if err := database.DB.Create(&banner).Error; err != nil {
		utils.ServerError(c, "创建失败")
		return
	}

	utils.Success(c, gin.H{"id": banner.ID})
}

func (bc *BannerController) Update(c *gin.Context) {
	id := c.Param("id")

	var req struct {
		Title    string `json:"title"`
		Image    string `json:"image"`
		Link     string `json:"link"`
		FlowerID uint   `json:"flower_id"`
		Sort     int    `json:"sort"`
		Status   int    `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var banner models.Banner
	if err := database.DB.First(&banner, id).Error; err != nil {
		utils.NotFound(c, "轮播图不存在")
		return
	}

	updates := make(map[string]interface{})
	if req.Title != "" {
		updates["title"] = req.Title
	}
	if req.Image != "" {
		updates["image"] = req.Image
	}
	if req.Link != "" {
		updates["link"] = req.Link
	}
	updates["flower_id"] = req.FlowerID
	updates["sort"] = req.Sort
	if req.Status != 0 {
		updates["status"] = req.Status
	}

	database.DB.Model(&banner).Updates(updates)
	utils.Success(c, nil)
}

func (bc *BannerController) Delete(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.Banner{}, id).Error; err != nil {
		utils.ServerError(c, "删除失败")
		return
	}

	utils.Success(c, nil)
}
