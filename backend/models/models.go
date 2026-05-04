package models

import (
	"time"

	"gorm.io/gorm"
)

type BaseModel struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

type User struct {
	BaseModel
	Username  string  `json:"username" gorm:"uniqueIndex;size:50;not null"`
	Password  string  `json:"-" gorm:"size:255;not null"`
	Nickname  string  `json:"nickname" gorm:"size:50"`
	Phone     string  `json:"phone" gorm:"size:20"`
	Email     string  `json:"email" gorm:"size:100"`
	Avatar    string  `json:"avatar" gorm:"size:255"`
	Balance   float64 `json:"balance" gorm:"type:decimal(10,2);default:0"`
	Status    int     `json:"status" gorm:"default:1"`
}

type Merchant struct {
	BaseModel
	Username  string `json:"username" gorm:"uniqueIndex;size:50;not null"`
	Password  string `json:"-" gorm:"size:255;not null"`
	ShopName  string `json:"shop_name" gorm:"size:100"`
	Phone     string `json:"phone" gorm:"size:20"`
	Email     string `json:"email" gorm:"size:100"`
	Avatar    string `json:"avatar" gorm:"size:255"`
	Address   string `json:"address" gorm:"size:255"`
	Status    int    `json:"status" gorm:"default:1"`
}

type Admin struct {
	BaseModel
	Username string `json:"username" gorm:"uniqueIndex;size:50;not null"`
	Password string `json:"-" gorm:"size:255;not null"`
	Nickname string `json:"nickname" gorm:"size:50"`
	Phone    string `json:"phone" gorm:"size:20"`
	Email    string `json:"email" gorm:"size:100"`
	Avatar   string `json:"avatar" gorm:"size:255"`
	Role     int    `json:"role" gorm:"default:1"`
}

type Category struct {
	BaseModel
	Name     string `json:"name" gorm:"size:50;not null"`
	Icon     string `json:"icon" gorm:"size:255"`
	Sort     int    `json:"sort" gorm:"default:0"`
	Status   int    `json:"status" gorm:"default:1"`
	Flowers  []Flower `json:"flowers,omitempty" gorm:"foreignKey:CategoryID"`
}

type Flower struct {
	BaseModel
	Name        string  `json:"name" gorm:"size:100;not null"`
	CategoryID  uint    `json:"category_id" gorm:"not null"`
	MerchantID  uint    `json:"merchant_id" gorm:"not null"`
	Price       float64 `json:"price" gorm:"type:decimal(10,2);not null"`
	OriginalPrice float64 `json:"original_price" gorm:"type:decimal(10,2)"`
	Stock       int     `json:"stock" gorm:"default:0"`
	Sales       int     `json:"sales" gorm:"default:0"`
	Image       string  `json:"image" gorm:"size:255"`
	Images      string  `json:"images" gorm:"type:text"`
	Description string  `json:"description" gorm:"type:text"`
	Material    string  `json:"material" gorm:"size:500"`
	Package     string  `json:"package" gorm:"size:500"`
	Occasion    string  `json:"occasion" gorm:"size:100"`
	IsRecommend int     `json:"is_recommend" gorm:"default:0"`
	IsHot       int     `json:"is_hot" gorm:"default:0"`
	Status      int     `json:"status" gorm:"default:1"`
	Category    *Category `json:"category,omitempty" gorm:"foreignKey:CategoryID"`
	Merchant    *Merchant `json:"merchant,omitempty" gorm:"foreignKey:MerchantID"`
}

type Cart struct {
	BaseModel
	UserID   uint    `json:"user_id" gorm:"not null;index"`
	FlowerID uint    `json:"flower_id" gorm:"not null;index"`
	Quantity int     `json:"quantity" gorm:"default:1"`
	Flower   *Flower `json:"flower,omitempty" gorm:"foreignKey:FlowerID"`
}

type Favorite struct {
	BaseModel
	UserID   uint    `json:"user_id" gorm:"not null;uniqueIndex:idx_user_flower"`
	FlowerID uint    `json:"flower_id" gorm:"not null;uniqueIndex:idx_user_flower"`
	Flower   *Flower `json:"flower,omitempty" gorm:"foreignKey:FlowerID"`
}

type Address struct {
	BaseModel
	UserID     uint   `json:"user_id" gorm:"not null;index"`
	Name       string `json:"name" gorm:"size:50;not null"`
	Phone      string `json:"phone" gorm:"size:20;not null"`
	Province   string `json:"province" gorm:"size:50"`
	City       string `json:"city" gorm:"size:50"`
	District   string `json:"district" gorm:"size:50"`
	Detail     string `json:"detail" gorm:"size:200;not null"`
	IsDefault  int    `json:"is_default" gorm:"default:0"`
}

type Order struct {
	BaseModel
	OrderNo       string  `json:"order_no" gorm:"uniqueIndex;size:32;not null"`
	UserID        uint    `json:"user_id" gorm:"not null;index"`
	MerchantID    uint    `json:"merchant_id" gorm:"not null;index"`
	TotalAmount   float64 `json:"total_amount" gorm:"type:decimal(10,2);not null"`
	PayAmount     float64 `json:"pay_amount" gorm:"type:decimal(10,2);not null"`
	Discount      float64 `json:"discount" gorm:"type:decimal(10,2);default:0"`
	Status        int     `json:"status" gorm:"default:0"`
	PayStatus     int     `json:"pay_status" gorm:"default:0"`
	PayTime       *time.Time `json:"pay_time"`
	ReceiveName   string  `json:"receive_name" gorm:"size:50"`
	ReceivePhone  string  `json:"receive_phone" gorm:"size:20"`
	ReceiveAddress string `json:"receive_address" gorm:"size:255"`
	Remark        string  `json:"remark" gorm:"size:500"`
	DeliverTime   *time.Time `json:"deliver_time"`
	CompleteTime  *time.Time `json:"complete_time"`
	Items         []OrderItem `json:"items,omitempty" gorm:"foreignKey:OrderID"`
	User          *User    `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Merchant      *Merchant `json:"merchant,omitempty" gorm:"foreignKey:MerchantID"`
}

type OrderItem struct {
	BaseModel
	OrderID    uint    `json:"order_id" gorm:"not null;index"`
	FlowerID   uint    `json:"flower_id" gorm:"not null"`
	FlowerName string  `json:"flower_name" gorm:"size:100"`
	FlowerImage string `json:"flower_image" gorm:"size:255"`
	Price      float64 `json:"price" gorm:"type:decimal(10,2);not null"`
	Quantity   int     `json:"quantity" gorm:"default:1"`
	Amount     float64 `json:"amount" gorm:"type:decimal(10,2);not null"`
}

type Comment struct {
	BaseModel
	UserID    uint   `json:"user_id" gorm:"not null;index"`
	FlowerID  uint   `json:"flower_id" gorm:"not null;index"`
	OrderID   uint   `json:"order_id" gorm:"not null"`
	Rating    int    `json:"rating" gorm:"default:5"`
	Content   string `json:"content" gorm:"type:text"`
	Images    string `json:"images" gorm:"type:text"`
	IsAnonymous int  `json:"is_anonymous" gorm:"default:0"`
	Status    int    `json:"status" gorm:"default:1"`
	User      *User  `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

type Consultation struct {
	BaseModel
	UserID     uint   `json:"user_id" gorm:"not null;index"`
	MerchantID uint   `json:"merchant_id" gorm:"not null;index"`
	Content    string `json:"content" gorm:"type:text;not null"`
	Reply      string `json:"reply" gorm:"type:text"`
	IsRead     int    `json:"is_read" gorm:"default:0"`
	IsReplied  int    `json:"is_replied" gorm:"default:0"`
	User       *User    `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Merchant   *Merchant `json:"merchant,omitempty" gorm:"foreignKey:MerchantID"`
}

type Announcement struct {
	BaseModel
	Title    string `json:"title" gorm:"size:100;not null"`
	Content  string `json:"content" gorm:"type:text;not null"`
	Image    string `json:"image" gorm:"size:255"`
	Type     int    `json:"type" gorm:"default:1"`
	Status   int    `json:"status" gorm:"default:1"`
	IsTop    int    `json:"is_top" gorm:"default:0"`
	Sort     int    `json:"sort" gorm:"default:0"`
}

type Banner struct {
	BaseModel
	Title   string `json:"title" gorm:"size:100"`
	Image   string `json:"image" gorm:"size:255;not null"`
	Link    string `json:"link" gorm:"size:255"`
	FlowerID uint  `json:"flower_id"`
	Sort    int    `json:"sort" gorm:"default:0"`
	Status  int    `json:"status" gorm:"default:1"`
}

type Menu struct {
	BaseModel
	Name     string `json:"name" gorm:"size:50;not null"`
	ParentID uint   `json:"parent_id" gorm:"default:0"`
	Type     int    `json:"type" gorm:"default:1"`
	Path     string `json:"path" gorm:"size:100"`
	Icon     string `json:"icon" gorm:"size:50"`
	Sort     int    `json:"sort" gorm:"default:0"`
	Status   int    `json:"status" gorm:"default:1"`
}

type OperationLog struct {
	BaseModel
	UserID   uint   `json:"user_id"`
	Username string `json:"username" gorm:"size:50"`
	Module   string `json:"module" gorm:"size:50"`
	Action   string `json:"action" gorm:"size:50"`
	Content  string `json:"content" gorm:"type:text"`
	IP       string `json:"ip" gorm:"size:50"`
}

type RechargeRecord struct {
	BaseModel
	UserID  uint    `json:"user_id" gorm:"not null;index"`
	Amount  float64 `json:"amount" gorm:"type:decimal(10,2);not null"`
	OrderNo string  `json:"order_no" gorm:"size:32;not null"`
	PayType int     `json:"pay_type" gorm:"default:1"`
	Status  int     `json:"status" gorm:"default:0"`
	PayTime *time.Time `json:"pay_time"`
}

const (
	StatusInactive = 0
	StatusActive   = 1
	StatusDisabled = 2

	OrderStatusPending    = 0
	OrderStatusPaid       = 1
	OrderStatusDelivering = 2
	OrderStatusCompleted  = 3
	OrderStatusCancelled  = 4

	PayStatusUnpaid = 0
	PayStatusPaid   = 1

	MenuTypeDir   = 0
	MenuTypeMenu  = 1
	MenuTypeButton = 2
)
