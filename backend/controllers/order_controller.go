package controllers

import (
	"fmt"
	"flowershop/database"
	"flowershop/middleware"
	"flowershop/models"
	"flowershop/utils"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type OrderController struct{}

func generateOrderNo() string {
	now := time.Now()
	return fmt.Sprintf("FS%s%06d", now.Format("20060102150405"), int(time.Now().UnixNano()%1000000))
}

func (oc *OrderController) CreateOrder(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var req struct {
		CartIDs  []uint `json:"cart_ids"`
		Address  string `json:"address"`
		ReceiveName  string `json:"receive_name"`
		ReceivePhone string `json:"receive_phone"`
		Remark   string `json:"remark"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if len(req.CartIDs) == 0 {
		utils.BadRequest(c, "请选择要购买的商品")
		return
	}

	var carts []models.Cart
	if err := database.DB.Preload("Flower").Where("id IN ? AND user_id = ?", req.CartIDs, userID).Find(&carts).Error; err != nil {
		utils.ServerError(c, "获取购物车失败")
		return
	}

	if len(carts) == 0 {
		utils.BadRequest(c, "购物车为空")
		return
	}

	var totalAmount float64
	merchantID := carts[0].Flower.MerchantID

	for _, cart := range carts {
		if cart.Flower.Stock < cart.Quantity {
			utils.BadRequest(c, fmt.Sprintf("商品【%s】库存不足", cart.Flower.Name))
			return
		}
		totalAmount += cart.Flower.Price * float64(cart.Quantity)
	}

	var user models.User
	database.DB.First(&user, userID)

	order := models.Order{
		OrderNo:        generateOrderNo(),
		UserID:         userID,
		MerchantID:     merchantID,
		TotalAmount:    totalAmount,
		PayAmount:      totalAmount,
		Status:         models.OrderStatusPending,
		PayStatus:      models.PayStatusUnpaid,
		ReceiveName:    req.ReceiveName,
		ReceivePhone:   req.ReceivePhone,
		ReceiveAddress: req.Address,
		Remark:         req.Remark,
	}

	err := database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&order).Error; err != nil {
			return err
		}

		for _, cart := range carts {
			item := models.OrderItem{
				OrderID:     order.ID,
				FlowerID:    cart.FlowerID,
				FlowerName:  cart.Flower.Name,
				FlowerImage: cart.Flower.Image,
				Price:       cart.Flower.Price,
				Quantity:    cart.Quantity,
				Amount:      cart.Flower.Price * float64(cart.Quantity),
			}
			if err := tx.Create(&item).Error; err != nil {
				return err
			}

			if err := tx.Delete(&cart).Error; err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		utils.ServerError(c, "创建订单失败: "+err.Error())
		return
	}

	utils.Success(c, gin.H{"order_id": order.ID, "order_no": order.OrderNo})
}

func (oc *OrderController) GetUserOrders(c *gin.Context) {
	userID := middleware.GetUserID(c)
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status := c.Query("status")

	var total int64
	var orders []models.Order

	query := database.DB.Model(&models.Order{}).Where("user_id = ?", userID)

	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	query.Preload("Items").Order("created_at desc").Offset(offset).Limit(pageSize).Find(&orders)

	utils.SuccessPage(c, orders, total, page, pageSize)
}

func (oc *OrderController) GetMerchantOrders(c *gin.Context) {
	merchantID := middleware.GetUserID(c)
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status := c.Query("status")

	var total int64
	var orders []models.Order

	query := database.DB.Model(&models.Order{}).Where("merchant_id = ?", merchantID)

	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	query.Preload("Items").Preload("User").Order("created_at desc").Offset(offset).Limit(pageSize).Find(&orders)

	utils.SuccessPage(c, orders, total, page, pageSize)
}

func (oc *OrderController) GetAllOrders(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status := c.Query("status")
	keyword := c.Query("keyword")

	var total int64
	var orders []models.Order

	query := database.DB.Model(&models.Order{})

	if status != "" {
		query = query.Where("status = ?", status)
	}
	if keyword != "" {
		query = query.Where("order_no LIKE ? OR receive_name LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	query.Preload("Items").Preload("User").Preload("Merchant").Order("created_at desc").Offset(offset).Limit(pageSize).Find(&orders)

	utils.SuccessPage(c, orders, total, page, pageSize)
}

func (oc *OrderController) GetOrderDetail(c *gin.Context) {
	id := c.Param("id")
	userID := middleware.GetUserID(c)
	role := middleware.GetRole(c)

	var order models.Order
	query := database.DB.Preload("Items").Preload("User").Preload("Merchant")

	if role == "user" {
		query = query.Where("user_id = ?", userID)
	} else if role == "merchant" {
		query = query.Where("merchant_id = ?", userID)
	}

	if err := query.First(&order, id).Error; err != nil {
		utils.NotFound(c, "订单不存在")
		return
	}

	utils.Success(c, order)
}

func (oc *OrderController) PayOrder(c *gin.Context) {
	id := c.Param("id")
	userID := middleware.GetUserID(c)

	var order models.Order
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&order).Error; err != nil {
		utils.NotFound(c, "订单不存在")
		return
	}

	if order.PayStatus == models.PayStatusPaid {
		utils.BadRequest(c, "订单已支付")
		return
	}

	var user models.User
	database.DB.First(&user, userID)

	if user.Balance < order.PayAmount {
		utils.BadRequest(c, "余额不足，请先充值")
		return
	}

	now := time.Now()
	err := database.DB.Transaction(func(tx *gorm.DB) error {
		user.Balance -= order.PayAmount
		if err := tx.Save(&user).Error; err != nil {
			return err
		}

		order.PayStatus = models.PayStatusPaid
		order.Status = models.OrderStatusPaid
		order.PayTime = &now
		if err := tx.Save(&order).Error; err != nil {
			return err
		}

		var items []models.OrderItem
		tx.Where("order_id = ?", order.ID).Find(&items)
		for _, item := range items {
			if err := tx.Model(&models.Flower{}).Where("id = ?", item.FlowerID).
				UpdateColumn("stock", gorm.Expr("stock - ?", item.Quantity)).
				UpdateColumn("sales", gorm.Expr("sales + ?", item.Quantity)).Error; err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		utils.ServerError(c, "支付失败")
		return
	}

	utils.Success(c, nil)
}

func (oc *OrderController) DeliverOrder(c *gin.Context) {
	id := c.Param("id")
	merchantID := middleware.GetUserID(c)
	role := middleware.GetRole(c)

	var order models.Order
	query := database.DB.Where("id = ?", id)
	if role == "merchant" {
		query = query.Where("merchant_id = ?", merchantID)
	}

	if err := query.First(&order).Error; err != nil {
		utils.NotFound(c, "订单不存在")
		return
	}

	if order.Status != models.OrderStatusPaid {
		utils.BadRequest(c, "订单状态不允许发货")
		return
	}

	now := time.Now()
	order.Status = models.OrderStatusDelivering
	order.DeliverTime = &now
	database.DB.Save(&order)

	utils.Success(c, nil)
}

func (oc *OrderController) CompleteOrder(c *gin.Context) {
	id := c.Param("id")
	userID := middleware.GetUserID(c)

	var order models.Order
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&order).Error; err != nil {
		utils.NotFound(c, "订单不存在")
		return
	}

	if order.Status != models.OrderStatusDelivering {
		utils.BadRequest(c, "订单状态不允许确认收货")
		return
	}

	now := time.Now()
	order.Status = models.OrderStatusCompleted
	order.CompleteTime = &now
	database.DB.Save(&order)

	utils.Success(c, nil)
}

func (oc *OrderController) CancelOrder(c *gin.Context) {
	id := c.Param("id")
	userID := middleware.GetUserID(c)

	var order models.Order
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&order).Error; err != nil {
		utils.NotFound(c, "订单不存在")
		return
	}

	if order.Status != models.OrderStatusPending {
		utils.BadRequest(c, "订单状态不允许取消")
		return
	}

	order.Status = models.OrderStatusCancelled
	database.DB.Save(&order)

	utils.Success(c, nil)
}
