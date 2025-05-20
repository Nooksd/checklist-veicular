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
	router := gin.New()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"https://localhost:5173", "https://forms.innova-energy.com.br"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "X-Requested-With", "Access-Control-Allow-Origin"},
		ExposeHeaders:    []string{"Content-Length", "Set-Cookie", "Access-Control-Allow-Origin"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	router.Use(gin.Logger())

	routes.AuthRoutes(router)

	authProtected := router.Group("/")
	authProtected.Use(middleware.Authenticate())

	authProtected.Static("/uploads", "./uploads")

	routes.UserRoutes(authProtected)
	routes.CarRoutes(authProtected)
	routes.CarEntryRoutes(authProtected)
	routes.FormsRoutes(authProtected)

	router.Run(":" + port)
}
