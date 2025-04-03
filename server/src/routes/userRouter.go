package routes

import (
	"github.com/gin-gonic/gin"

	controller "server/src/controllers"
)

func UserRoutes(router *gin.RouterGroup) {
	user := router.Group("/user")
	{
		user.GET("/:userId", controller.GetUser())
		user.GET("/", controller.GetUsers())
		user.GET("/current", controller.GetCurrentUser())
		user.POST("/create", controller.CreateUser())
		user.DELETE("/delete/:userId", controller.DeleteUser())
		user.PUT("/update/:userId", controller.UpdateUser())
		user.PUT("/disable/:userId", controller.DisableUser())
		user.PUT("/enable/:userId", controller.EnableUser())
	}
}
