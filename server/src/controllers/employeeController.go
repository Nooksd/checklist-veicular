package controllers

import (
	"context"
	"net/http"
	database "server/src/db"
	helper "server/src/helpers"
	model "server/src/models"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var employeeCollection = database.OpenCollection(database.Client, "employees")

func CreateEmployee() gin.HandlerFunc {
	return func(c *gin.Context) {
		if ok, _, _ := helper.CheckAdminOrUidPermission(c, ""); !ok {
			return
		}

		var employee model.Employee
		if err := c.ShouldBindJSON(&employee); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
			return
		}

		employee.ID = primitive.NewObjectID()
		employee.IsActive = true

		if err := validate.Struct(employee); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		_, err := employeeCollection.InsertOne(ctx, employee)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar funcionário"})
			return
		}

		c.JSON(http.StatusCreated, employee)
	}
}

func GetEmployee() gin.HandlerFunc {
	return func(c *gin.Context) {
		if ok, _, _ := helper.CheckAdminOrUidPermission(c, ""); !ok {
			return
		}

		employeeID := c.Param("employeeId")
		objectID, err := primitive.ObjectIDFromHex(employeeID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var employee model.Employee
		err = employeeCollection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&employee)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Funcionário não encontrado"})
			return
		}

		c.JSON(http.StatusOK, employee)
	}
}

func GetEmployees() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		search := c.Query("search")
		isActive := c.Query("isActive")

		searchFilter := bson.M{}
		if search != "" {
			searchFilter["$or"] = []bson.M{
				{"name": bson.M{"$regex": search, "$options": "i"}},
				{"cnh": bson.M{"$regex": search, "$options": "i"}},
			}
		}

		active := true
		if isActive == "false" {
			active = false
		}
		searchFilter["isActive"] = active

		var employees []model.Employee
		cursor, err := employeeCollection.Find(ctx, searchFilter)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar funcionários"})
			return
		}
		defer cursor.Close(ctx)

		for cursor.Next(ctx) {
			var employee model.Employee
			cursor.Decode(&employee)
			employees = append(employees, employee)
		}

		c.JSON(http.StatusOK, employees)
	}
}

func UpdateEmployee() gin.HandlerFunc {
	return func(c *gin.Context) {
		if ok, _, _ := helper.CheckAdminOrUidPermission(c, ""); !ok {
			return
		}

		employeeID := c.Param("employeeId")
		objectID, err := primitive.ObjectIDFromHex(employeeID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
			return
		}

		var updateData bson.M
		if err := c.BindJSON(&updateData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
			return
		}

		delete(updateData, "id")

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		update := bson.M{"$set": updateData}
		result, err := employeeCollection.UpdateOne(ctx, bson.M{"_id": objectID}, update)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar funcionário"})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Funcionário não encontrado"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Funcionário atualizado com sucesso"})
	}
}

func DeleteEmployee() gin.HandlerFunc {
	return func(c *gin.Context) {
		if ok, _, _ := helper.CheckAdminOrUidPermission(c, ""); !ok {
			return
		}

		employeeID := c.Param("employeeId")
		objectID, err := primitive.ObjectIDFromHex(employeeID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		result, err := employeeCollection.DeleteOne(ctx, bson.M{"_id": objectID})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao deletar funcionário"})
			return
		}

		if result.DeletedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Funcionário não encontrado"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Funcionário deletado com sucesso"})
	}
}

func DisableEmployee() gin.HandlerFunc {
	return func(c *gin.Context) {
		if ok, _, _ := helper.CheckAdminOrUidPermission(c, ""); !ok {
			return
		}

		employeeID := c.Param("employeeId")
		objectID, err := primitive.ObjectIDFromHex(employeeID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		result, err := employeeCollection.UpdateOne(ctx, bson.M{"_id": objectID}, bson.M{"$set": bson.M{"isActive": false}})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao desativar funcionário"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Funcionário desativado com sucesso", "result": result})
	}
}

func EnableEmployee() gin.HandlerFunc {
	return func(c *gin.Context) {
		if ok, _, _ := helper.CheckAdminOrUidPermission(c, ""); !ok {
			return
		}

		employeeID := c.Param("employeeId")
		objectID, err := primitive.ObjectIDFromHex(employeeID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		result, err := employeeCollection.UpdateOne(ctx, bson.M{"_id": objectID}, bson.M{"$set": bson.M{"isActive": true}})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao desativar funcionário"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Funcionário ativado com sucesso", "result": result})
	}
}
