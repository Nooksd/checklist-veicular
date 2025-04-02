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
	"go.mongodb.org/mongo-driver/mongo"
)

var carCollection *mongo.Collection = database.OpenCollection(database.Client, "cars")

func GetCar() gin.HandlerFunc {
	return func(c *gin.Context) {
		if ok, _, _ := helper.CheckAdminOrUidPermission(c, ""); !ok {
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var car model.Car

		carID := c.Param("carId")
		objectID, err := primitive.ObjectIDFromHex(carID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
			return
		}

		err = carCollection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&car)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				c.JSON(http.StatusNotFound, gin.H{"error": "Carro não encontrado"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar carro"})
			}
			return
		}

		c.JSON(http.StatusOK, car)
	}
}

func GetCars() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var cars []model.Car

		cursor, err := carCollection.Find(ctx, bson.M{"isActive": true})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar carros"})
			return
		}

		defer cursor.Close(ctx)

		for cursor.Next(ctx) {
			var car model.Car
			cursor.Decode(&car)
			cars = append(cars, car)
		}
		if err = cursor.Err(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar carros"})
			return
		}

		c.JSON(http.StatusOK, cars)
	}
}

func CreateCar() gin.HandlerFunc {
	return func(c *gin.Context) {
		if ok, _, _ := helper.CheckAdminOrUidPermission(c, ""); !ok {
			return
		}

		var car model.Car
		if err := c.ShouldBindJSON(&car); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
			return
		}

		car.ID = primitive.NewObjectID()
		car.IsActive = true

		if err := validate.Struct(car); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		_, err := carCollection.InsertOne(ctx, car)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar carro"})
			return
		}

		c.JSON(http.StatusCreated, car)
	}
}

func DeleteCar() gin.HandlerFunc {
	return func(c *gin.Context) {
		if ok, _, _ := helper.CheckAdminOrUidPermission(c, ""); !ok {
			return
		}

		carID := c.Param("carId")
		objectID, err := primitive.ObjectIDFromHex(carID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		update := bson.M{"$set": bson.M{"isActive": false}}
		result, err := carCollection.UpdateOne(ctx, bson.M{"_id": objectID}, update)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao desativar carro"})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Carro não encontrado"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Carro desativado com sucesso"})
	}
}

func UpdateCar() gin.HandlerFunc {
	return func(c *gin.Context) {
		if ok, _, _ := helper.CheckAdminOrUidPermission(c, ""); !ok {
			return
		}

		carID := c.Param("carId")
		objectID, err := primitive.ObjectIDFromHex(carID)
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
		result, err := carCollection.UpdateOne(ctx, bson.M{"_id": objectID}, update)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar carro"})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Carro não encontrado"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Carro atualizado com sucesso"})
	}
}
