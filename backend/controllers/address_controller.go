package controllers

import (
	"flowershop/database"
	"flowershop/middleware"
	"flowershop/models"
	"flowershop/utils"

	"github.com/gin-gonic/gin"
)

type AddressController struct{}

func (ac *AddressController) GetList(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var addresses []models.Address
	database.DB.Where("user_id = ?", userID).Order("is_default desc, created_at desc").Find(&addresses)

	utils.Success(c, addresses)
}

func (ac *AddressController) GetDetail(c *gin.Context) {
	id := c.Param("id")
	userID := middleware.GetUserID(c)

	var address models.Address
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&address).Error; err != nil {
		utils.NotFound(c, "地址不存在")
		return
	}

	utils.Success(c, address)
}

func (ac *AddressController) GetDefault(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var address models.Address
	if err := database.DB.Where("user_id = ? AND is_default = ?", userID, 1).First(&address).Error; err != nil {
		database.DB.Where("user_id = ?", userID).Order("created_at desc").First(&address)
	}

	utils.Success(c, address)
}

func (ac *AddressController) Create(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var req struct {
		Name      string `json:"name" binding:"required"`
		Phone     string `json:"phone" binding:"required"`
		Province  string `json:"province"`
		City      string `json:"city"`
		District  string `json:"district"`
		Detail    string `json:"detail" binding:"required"`
		IsDefault int    `json:"is_default"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if req.IsDefault == 1 {
		database.DB.Model(&models.Address{}).Where("user_id = ?", userID).Update("is_default", 0)
	}

	address := models.Address{
		UserID:    userID,
		Name:      req.Name,
		Phone:     req.Phone,
		Province:  req.Province,
		City:      req.City,
		District:  req.District,
		Detail:    req.Detail,
		IsDefault: req.IsDefault,
	}

	if err := database.DB.Create(&address).Error; err != nil {
		utils.ServerError(c, "创建失败")
		return
	}

	utils.Success(c, gin.H{"id": address.ID})
}

func (ac *AddressController) Update(c *gin.Context) {
	id := c.Param("id")
	userID := middleware.GetUserID(c)

	var req struct {
		Name      string `json:"name"`
		Phone     string `json:"phone"`
		Province  string `json:"province"`
		City      string `json:"city"`
		District  string `json:"district"`
		Detail    string `json:"detail"`
		IsDefault int    `json:"is_default"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var address models.Address
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&address).Error; err != nil {
		utils.NotFound(c, "地址不存在")
		return
	}

	if req.IsDefault == 1 && address.IsDefault != 1 {
		database.DB.Model(&models.Address{}).Where("user_id = ?", userID).Update("is_default", 0)
	}

	updates := make(map[string]interface{})
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Phone != "" {
		updates["phone"] = req.Phone
	}
	if req.Province != "" {
		updates["province"] = req.Province
	}
	if req.City != "" {
		updates["city"] = req.City
	}
	if req.District != "" {
		updates["district"] = req.District
	}
	if req.Detail != "" {
		updates["detail"] = req.Detail
	}
	if req.IsDefault != 0 {
		updates["is_default"] = req.IsDefault
	}

	database.DB.Model(&address).Updates(updates)
	utils.Success(c, nil)
}

func (ac *AddressController) Delete(c *gin.Context) {
	id := c.Param("id")
	userID := middleware.GetUserID(c)

	var address models.Address
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&address).Error; err != nil {
		utils.NotFound(c, "地址不存在")
		return
	}

	database.DB.Delete(&address)
	utils.Success(c, nil)
}

func (ac *AddressController) SetDefault(c *gin.Context) {
	id := c.Param("id")
	userID := middleware.GetUserID(c)

	var address models.Address
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&address).Error; err != nil {
		utils.NotFound(c, "地址不存在")
		return
	}

	database.DB.Model(&models.Address{}).Where("user_id = ?", userID).Update("is_default", 0)
	address.IsDefault = 1
	database.DB.Save(&address)

	utils.Success(c, nil)
}
