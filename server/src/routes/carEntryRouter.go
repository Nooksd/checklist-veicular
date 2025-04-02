package routes

import (
	controller "server/src/controllers"

	"github.com/gin-gonic/gin"
)

func CarEntryRoutes(router *gin.RouterGroup) {
	car := router.Group("/car-entry")
	{
		car.POST("/start", controller.StartCarEntry())
		car.PUT("/end", controller.EndCarEntry())
		car.POST("/fuel", controller.FuelEntry())
		car.GET("/:entryId", controller.GetCarEntry())
		car.GET("/", controller.GetCarEntrys())
		car.DELETE("/delete/:entryId", controller.DeleteCarEntry())

		car.POST("/:entryId/checkin/upload", controller.UploadCheckInImages())
		car.POST("/:entryId/checkout/upload", controller.UploadCheckOutImages())
	}
}
