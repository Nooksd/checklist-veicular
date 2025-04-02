package routes

import (
	controller "server/src/controllers"

	"github.com/gin-gonic/gin"
)

func EmployeeRoutes(router *gin.RouterGroup) {
	employee := router.Group("/employee")
	{
		employee.GET("/", controller.GetEmployees())
		employee.GET("/:employeeId", controller.GetEmployee())
		employee.POST("/create", controller.CreateEmployee())
		employee.PUT("/update/:employeeId", controller.UpdateEmployee())
		employee.DELETE("/delete/:employeeId", controller.DeleteEmployee())
		employee.PUT("/disable/:employeeId", controller.DisableEmployee())
		employee.PUT("/enable/:employeeId", controller.EnableEmployee())
	}
}
