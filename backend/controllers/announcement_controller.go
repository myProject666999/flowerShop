package controllers

import (
	"flowershop/database"
	"flowershop/models"
	"flowershop/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

type AnnouncementController struct{}

func (ac *AnnouncementController) GetList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status := c.Query("status")

	var total int64
	var announcements []models.Announcement

	query := database.DB.Model(&models.Announcement{})

	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	query.Order("is_top desc, sort asc, created_at desc").Offset(offset).Limit(pageSize).Find(&announcements)

	utils.SuccessPage(c, announcements, total, page, pageSize)
}

func (ac *AnnouncementController) GetDetail(c *gin.Context) {
	id := c.Param("id")

	var announcement models.Announcement
	if err := database.DB.First(&announcement, id).Error; err != nil {
		utils.NotFound(c, "公告不存在")
		return
	}

	utils.Success(c, announcement)
}

func (ac *AnnouncementController) Create(c *gin.Context) {
	var req struct {
		Title   string `json:"title" binding:"required"`
		Content string `json:"content" binding:"required"`
		Image   string `json:"image"`
		Type    int    `json:"type"`
		Status  int    `json:"status"`
		IsTop   int    `json:"is_top"`
		Sort    int    `json:"sort"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	announcement := models.Announcement{
		Title:   req.Title,
		Content: req.Content,
		Image:   req.Image,
		Type:    req.Type,
		Status:  req.Status,
		IsTop:   req.IsTop,
		Sort:    req.Sort,
	}
	if announcement.Status == 0 {
		announcement.Status = models.StatusActive
	}
	if announcement.Type == 0 {
		announcement.Type = 1
	}

	if err := database.DB.Create(&announcement).Error; err != nil {
		utils.ServerError(c, "创建失败")
		return
	}

	utils.Success(c, gin.H{"id": announcement.ID})
}

func (ac *AnnouncementController) Update(c *gin.Context) {
	id := c.Param("id")

	var req struct {
		Title   string `json:"title"`
		Content string `json:"content"`
		Image   string `json:"image"`
		Type    int    `json:"type"`
		Status  int    `json:"status"`
		IsTop   int    `json:"is_top"`
		Sort    int    `json:"sort"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var announcement models.Announcement
	if err := database.DB.First(&announcement, id).Error; err != nil {
		utils.NotFound(c, "公告不存在")
		return
	}

	updates := make(map[string]interface{})
	if req.Title != "" {
		updates["title"] = req.Title
	}
	if req.Content != "" {
		updates["content"] = req.Content
	}
	if req.Image != "" {
		updates["image"] = req.Image
	}
	if req.Type != 0 {
		updates["type"] = req.Type
	}
	if req.Status != 0 {
		updates["status"] = req.Status
	}
	updates["is_top"] = req.IsTop
	updates["sort"] = req.Sort

	database.DB.Model(&announcement).Updates(updates)
	utils.Success(c, nil)
}

func (ac *AnnouncementController) Delete(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.Announcement{}, id).Error; err != nil {
		utils.ServerError(c, "删除失败")
		return
	}

	utils.Success(c, nil)
}
