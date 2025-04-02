package main

import (
	"os"
	"time"

	middleware "server/src/middlewares"
	routes "server/src/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	router := gin.New()
	router.Use(gin.Logger())

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"https://forms.innova-energy.com.br", "https://forms-api.innova-energy.com.br", "https://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length", "Set-Cookie"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	routes.AuthRoutes(router)

	authProtected := router.Group("/")
	authProtected.Use(middleware.Authenticate())

	authProtected.Static("/uploads", "./uploads")

	routes.UserRoutes(authProtected)
	routes.CarRoutes(authProtected)
	routes.CarEntryRoutes(authProtected)
	routes.EmployeeRoutes(authProtected)

	router.Run(":" + port)
}
