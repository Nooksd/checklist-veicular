package routes

import (
	controller "server/src/controllers"

	"github.com/gin-gonic/gin"
)

func FormsRoutes(router *gin.RouterGroup) {
	car := router.Group("/forms")
	{
		car.GET("/statistics", controller.GetStatistics())
	}
}
