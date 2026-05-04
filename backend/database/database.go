package database

import (
	"fmt"
	"log"

	"flowershop/config"
	"flowershop/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB() error {
	dsn := config.GetDSN()
	fmt.Println("Connecting to database with DSN:", dsn)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	DB = db
	log.Println("Database connected successfully")

	err = migrateTables()
	if err != nil {
		return fmt.Errorf("failed to migrate tables: %w", err)
	}

	err = seedData()
	if err != nil {
		return fmt.Errorf("failed to seed data: %w", err)
	}

	return nil
}

func migrateTables() error {
	err := DB.AutoMigrate(
		&models.User{},
		&models.Merchant{},
		&models.Admin{},
		&models.Category{},
		&models.Flower{},
		&models.Cart{},
		&models.Favorite{},
		&models.Address{},
		&models.Order{},
		&models.OrderItem{},
		&models.Comment{},
		&models.Consultation{},
		&models.Announcement{},
		&models.Banner{},
		&models.Menu{},
		&models.OperationLog{},
		&models.RechargeRecord{},
	)
	if err != nil {
		return err
	}
	log.Println("Tables migrated successfully")
	return nil
}

func seedData() error {
	var adminCount int64
	DB.Model(&models.Admin{}).Count(&adminCount)
	if adminCount == 0 {
		admin := models.Admin{
			Username: "admin",
			Password: HashPassword("admin123"),
			Nickname: "超级管理员",
			Role:     1,
		}
		if err := DB.Create(&admin).Error; err != nil {
			return err
		}
		log.Println("Default admin created: admin / admin123")
	}

	var merchantCount int64
	DB.Model(&models.Merchant{}).Count(&merchantCount)
	if merchantCount == 0 {
		merchant := models.Merchant{
			Username: "merchant",
			Password: HashPassword("123456"),
			ShopName: "花花世界花店",
			Phone:    "13800138000",
		}
		if err := DB.Create(&merchant).Error; err != nil {
			return err
		}
		log.Println("Default merchant created: merchant / 123456")
	}

	var categoryCount int64
	DB.Model(&models.Category{}).Count(&categoryCount)
	if categoryCount == 0 {
		categories := []models.Category{
			{Name: "生日鲜花", Sort: 1},
			{Name: "爱情鲜花", Sort: 2},
			{Name: "商务鲜花", Sort: 3},
			{Name: "慰问鲜花", Sort: 4},
			{Name: "节日鲜花", Sort: 5},
		}
		if err := DB.Create(&categories).Error; err != nil {
			return err
		}
		log.Println("Default categories created")
	}

	return nil
}

func HashPassword(password string) string {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Println("Password hash failed:", err)
		return password
	}
	return string(hashedPassword)
}
