package routes

import (
	controller "server/src/controllers"

	"github.com/gin-gonic/gin"
)

func AuthRoutes(router *gin.Engine) {
	auth := router.Group("/auth")
	{
		auth.POST("/login", controller.LoginUser())
		auth.POST("/logout", controller.LogoutUser())
		auth.GET("/refresh-token", controller.RefreshToken())
	}
}
