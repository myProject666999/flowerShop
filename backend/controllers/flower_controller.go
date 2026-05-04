package controllers

import (
	"flowershop/database"
	"flowershop/middleware"
	"flowershop/models"
	"flowershop/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

type FlowerController struct{}

func (fc *FlowerController) GetList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	categoryID := c.Query("category_id")
	keyword := c.Query("keyword")
	isRecommend := c.Query("is_recommend")
	isHot := c.Query("is_hot")

	var total int64
	var flowers []models.Flower

	query := database.DB.Model(&models.Flower{}).Where("status = ?", models.StatusActive)

	if categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}
	if keyword != "" {
		query = query.Where("name LIKE ? OR description LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}
	if isRecommend == "1" {
		query = query.Where("is_recommend = ?", 1)
	}
	if isHot == "1" {
		query = query.Where("is_hot = ?", 1)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	query.Preload("Category").Preload("Merchant").Order("created_at desc").Offset(offset).Limit(pageSize).Find(&flowers)

	utils.SuccessPage(c, flowers, total, page, pageSize)
}

func (fc *FlowerController) GetDetail(c *gin.Context) {
	id := c.Param("id")

	var flower models.Flower
	if err := database.DB.Preload("Category").Preload("Merchant").First(&flower, id).Error; err != nil {
		utils.NotFound(c, "鲜花不存在")
		return
	}

	if flower.Status != models.StatusActive {
		utils.NotFound(c, "鲜花已下架")
		return
	}

	var comments []models.Comment
	database.DB.Where("flower_id = ? AND status = ?", id, models.StatusActive).
		Preload("User").Order("created_at desc").Limit(10).Find(&comments)

	utils.Success(c, gin.H{
		"flower":   flower,
		"comments": comments,
	})
}

func (fc *FlowerController) GetCategories(c *gin.Context) {
	var categories []models.Category
	database.DB.Where("status = ?", models.StatusActive).Order("sort asc").Find(&categories)
	utils.Success(c, categories)
}

func (fc *FlowerController) GetBanners(c *gin.Context) {
	var banners []models.Banner
	database.DB.Where("status = ?", models.StatusActive).Order("sort asc").Find(&banners)
	utils.Success(c, banners)
}

func (fc *FlowerController) GetAnnouncements(c *gin.Context) {
	var announcements []models.Announcement
	database.DB.Where("status = ?", models.StatusActive).Order("is_top desc, sort asc, created_at desc").Limit(10).Find(&announcements)
	utils.Success(c, announcements)
}

func (fc *FlowerController) CreateFlower(c *gin.Context) {
	merchantID := middleware.GetUserID(c)
	role := middleware.GetRole(c)

	var req struct {
		Name          string  `json:"name" binding:"required"`
		CategoryID    uint    `json:"category_id" binding:"required"`
		Price         float64 `json:"price" binding:"required"`
		OriginalPrice float64 `json:"original_price"`
		Stock         int     `json:"stock"`
		Image         string  `json:"image"`
		Images        string  `json:"images"`
		Description   string  `json:"description"`
		Material      string  `json:"material"`
		Package       string  `json:"package"`
		Occasion      string  `json:"occasion"`
		IsRecommend   int     `json:"is_recommend"`
		IsHot         int     `json:"is_hot"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	flower := models.Flower{
		Name:          req.Name,
		CategoryID:    req.CategoryID,
		MerchantID:    merchantID,
		Price:         req.Price,
		OriginalPrice: req.OriginalPrice,
		Stock:         req.Stock,
		Image:         req.Image,
		Images:        req.Images,
		Description:   req.Description,
		Material:      req.Material,
		Package:       req.Package,
		Occasion:      req.Occasion,
		IsRecommend:   req.IsRecommend,
		IsHot:         req.IsHot,
		Status:        models.StatusActive,
	}

	if role == "admin" {
		if reqFlowerMerchantID := c.Query("merchant_id"); reqFlowerMerchantID != "" {
			mID, _ := strconv.Atoi(reqFlowerMerchantID)
			flower.MerchantID = uint(mID)
		}
	}

	if err := database.DB.Create(&flower).Error; err != nil {
		utils.ServerError(c, "创建失败")
		return
	}

	utils.Success(c, gin.H{"id": flower.ID})
}

func (fc *FlowerController) UpdateFlower(c *gin.Context) {
	id := c.Param("id")
	merchantID := middleware.GetUserID(c)
	role := middleware.GetRole(c)

	var flower models.Flower
	if err := database.DB.First(&flower, id).Error; err != nil {
		utils.NotFound(c, "鲜花不存在")
		return
	}

	if role != "admin" && flower.MerchantID != merchantID {
		utils.Forbidden(c, "无权限修改此鲜花")
		return
	}

	var req struct {
		Name          string  `json:"name"`
		CategoryID    uint    `json:"category_id"`
		Price         float64 `json:"price"`
		OriginalPrice float64 `json:"original_price"`
		Stock         int     `json:"stock"`
		Image         string  `json:"image"`
		Images        string  `json:"images"`
		Description   string  `json:"description"`
		Material      string  `json:"material"`
		Package       string  `json:"package"`
		Occasion      string  `json:"occasion"`
		IsRecommend   int     `json:"is_recommend"`
		IsHot         int     `json:"is_hot"`
		Status        int     `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	updates := make(map[string]interface{})
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.CategoryID != 0 {
		updates["category_id"] = req.CategoryID
	}
	if req.Price != 0 {
		updates["price"] = req.Price
	}
	if req.OriginalPrice != 0 {
		updates["original_price"] = req.OriginalPrice
	}
	if req.Stock != 0 {
		updates["stock"] = req.Stock
	}
	if req.Image != "" {
		updates["image"] = req.Image
	}
	if req.Images != "" {
		updates["images"] = req.Images
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}
	if req.Material != "" {
		updates["material"] = req.Material
	}
	if req.Package != "" {
		updates["package"] = req.Package
	}
	if req.Occasion != "" {
		updates["occasion"] = req.Occasion
	}
	updates["is_recommend"] = req.IsRecommend
	updates["is_hot"] = req.IsHot
	if req.Status != 0 {
		updates["status"] = req.Status
	}

	if err := database.DB.Model(&flower).Updates(updates).Error; err != nil {
		utils.ServerError(c, "更新失败")
		return
	}

	utils.Success(c, nil)
}

func (fc *FlowerController) DeleteFlower(c *gin.Context) {
	id := c.Param("id")
	merchantID := middleware.GetUserID(c)
	role := middleware.GetRole(c)

	var flower models.Flower
	if err := database.DB.First(&flower, id).Error; err != nil {
		utils.NotFound(c, "鲜花不存在")
		return
	}

	if role != "admin" && flower.MerchantID != merchantID {
		utils.Forbidden(c, "无权限删除此鲜花")
		return
	}

	if err := database.DB.Delete(&flower).Error; err != nil {
		utils.ServerError(c, "删除失败")
		return
	}

	utils.Success(c, nil)
}

func (fc *FlowerController) GetMerchantFlowers(c *gin.Context) {
	merchantID := middleware.GetUserID(c)
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var total int64
	var flowers []models.Flower

	query := database.DB.Model(&models.Flower{}).Where("merchant_id = ?", merchantID)
	query.Count(&total)

	offset := (page - 1) * pageSize
	query.Preload("Category").Order("created_at desc").Offset(offset).Limit(pageSize).Find(&flowers)

	utils.SuccessPage(c, flowers, total, page, pageSize)
}

func (fc *FlowerController) CreateCategory(c *gin.Context) {
	var req struct {
		Name   string `json:"name" binding:"required"`
		Icon   string `json:"icon"`
		Sort   int    `json:"sort"`
		Status int    `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	category := models.Category{
		Name:   req.Name,
		Icon:   req.Icon,
		Sort:   req.Sort,
		Status: req.Status,
	}
	if category.Status == 0 {
		category.Status = models.StatusActive
	}

	if err := database.DB.Create(&category).Error; err != nil {
		utils.ServerError(c, "创建失败")
		return
	}

	utils.Success(c, gin.H{"id": category.ID})
}

func (fc *FlowerController) UpdateCategory(c *gin.Context) {
	id := c.Param("id")

	var category models.Category
	if err := database.DB.First(&category, id).Error; err != nil {
		utils.NotFound(c, "分类不存在")
		return
	}

	var req struct {
		Name   string `json:"name"`
		Icon   string `json:"icon"`
		Sort   int    `json:"sort"`
		Status int    `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	updates := make(map[string]interface{})
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Icon != "" {
		updates["icon"] = req.Icon
	}
	updates["sort"] = req.Sort
	if req.Status != 0 {
		updates["status"] = req.Status
	}

	if err := database.DB.Model(&category).Updates(updates).Error; err != nil {
		utils.ServerError(c, "更新失败")
		return
	}

	utils.Success(c, nil)
}

func (fc *FlowerController) DeleteCategory(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.Category{}, id).Error; err != nil {
		utils.ServerError(c, "删除失败")
		return
	}

	utils.Success(c, nil)
}
