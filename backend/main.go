package main

import (
	"fmt"
	"log"

	"flowershop/config"
	"flowershop/database"
	"flowershop/routes"
)

func main() {
	fmt.Println("========================================")
	fmt.Println("    在线花店系统 - 后端API服务")
	fmt.Println("    使用 Gin + GORM + MySQL")
	fmt.Println("========================================")

	if err := config.LoadConfig(); err != nil {
		log.Fatal("加载配置失败:", err)
	}
	log.Println("配置加载成功")

	if err := database.InitDB(); err != nil {
		log.Fatal("数据库初始化失败:", err)
	}
	log.Println("数据库初始化成功")

	r := routes.SetupRouter()

	port := config.AppConfig.Port
	log.Printf("服务启动在端口: %s", port)
	log.Printf("API基础地址: http://localhost:%s/api", port)

	if err := r.Run(":" + port); err != nil {
		log.Fatal("服务启动失败:", err)
	}
}
