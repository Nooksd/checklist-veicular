package routes

import (
	controller "server/src/controllers"

	"github.com/gin-gonic/gin"
)

func CarRoutes(router *gin.RouterGroup) {
	car := router.Group("/car")
	{
		car.GET("/:carId", controller.GetCar())
		car.GET("/", controller.GetCars())
		car.POST("/create", controller.CreateCar())
		car.DELETE("/delete/:carId", controller.DeleteCar())
		car.PUT("/update/:carId", controller.UpdateCar())
		car.PUT("/disable/:carId", controller.DisableCar())
		car.PUT("/enable/:carId", controller.EnableCar())
	}
}
