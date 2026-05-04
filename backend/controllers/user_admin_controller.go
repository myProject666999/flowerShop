package controllers

import (
	"flowershop/database"
	"flowershop/models"
	"flowershop/utils"
	"strconv"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type UserAdminController struct{}

func (uac *UserAdminController) GetUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")
	status := c.Query("status")

	var total int64
	var users []models.User

	query := database.DB.Model(&models.User{})

	if keyword != "" {
		query = query.Where("username LIKE ? OR nickname LIKE ? OR phone LIKE ?", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	query.Order("created_at desc").Offset(offset).Limit(pageSize).Find(&users)

	utils.SuccessPage(c, users, total, page, pageSize)
}

func (uac *UserAdminController) GetUserDetail(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		utils.NotFound(c, "用户不存在")
		return
	}

	utils.Success(c, user)
}

func (uac *UserAdminController) CreateUser(c *gin.Context) {
	var req struct {
		Username string  `json:"username" binding:"required"`
		Password string  `json:"password" binding:"required"`
		Nickname string  `json:"nickname"`
		Phone    string  `json:"phone"`
		Email    string  `json:"email"`
		Balance  float64 `json:"balance"`
		Status   int     `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var existing models.User
	if err := database.DB.Where("username = ?", req.Username).First(&existing).Error; err == nil {
		utils.BadRequest(c, "用户名已存在")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.ServerError(c, "密码加密失败")
		return
	}

	user := models.User{
		Username: req.Username,
		Password: string(hashedPassword),
		Nickname: req.Nickname,
		Phone:    req.Phone,
		Email:    req.Email,
		Balance:  req.Balance,
		Status:   req.Status,
	}
	if user.Status == 0 {
		user.Status = models.StatusActive
	}

	if err := database.DB.Create(&user).Error; err != nil {
		utils.ServerError(c, "创建失败")
		return
	}

	utils.Success(c, gin.H{"id": user.ID})
}

func (uac *UserAdminController) UpdateUser(c *gin.Context) {
	id := c.Param("id")

	var req struct {
		Nickname string  `json:"nickname"`
		Phone    string  `json:"phone"`
		Email    string  `json:"email"`
		Balance  float64 `json:"balance"`
		Status   int     `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		utils.NotFound(c, "用户不存在")
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
	updates["balance"] = req.Balance
	if req.Status != 0 {
		updates["status"] = req.Status
	}

	database.DB.Model(&user).Updates(updates)
	utils.Success(c, nil)
}

func (uac *UserAdminController) ResetPassword(c *gin.Context) {
	id := c.Param("id")

	var req struct {
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		utils.NotFound(c, "用户不存在")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.ServerError(c, "密码加密失败")
		return
	}

	user.Password = string(hashedPassword)
	database.DB.Save(&user)

	utils.Success(c, nil)
}

func (uac *UserAdminController) DeleteUser(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.User{}, id).Error; err != nil {
		utils.ServerError(c, "删除失败")
		return
	}

	utils.Success(c, nil)
}
